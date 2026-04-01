"use client";

import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Building2, Phone, Mail, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

type Step = "credential" | "otp" | "register";
type LoginMethod = "phone" | "email";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

const ROLE_OPTIONS = [
  { value: "OWNER", label: "PG Owner", description: "I own / manage PG properties" },
  { value: "ADMIN", label: "Admin / Staff", description: "I help manage a PG property" },
  { value: "GUEST", label: "Guest / Tenant", description: "I am looking for or staying at a PG" },
];

const COUNTRY_CODES = [
  { code: "+91", country: "IN", flag: "🇮🇳", label: "India (+91)" },
  { code: "+1", country: "US", flag: "🇺🇸", label: "USA (+1)" },
  { code: "+44", country: "GB", flag: "🇬🇧", label: "UK (+44)" },
  { code: "+971", country: "AE", flag: "🇦🇪", label: "UAE (+971)" },
  { code: "+65", country: "SG", flag: "🇸🇬", label: "Singapore (+65)" },
  { code: "+61", country: "AU", flag: "🇦🇺", label: "Australia (+61)" },
  { code: "+49", country: "DE", flag: "🇩🇪", label: "Germany (+49)" },
  { code: "+81", country: "JP", flag: "🇯🇵", label: "Japan (+81)" },
  { code: "+86", country: "CN", flag: "🇨🇳", label: "China (+86)" },
  { code: "+33", country: "FR", flag: "🇫🇷", label: "France (+33)" },
  { code: "+7", country: "RU", flag: "🇷🇺", label: "Russia (+7)" },
  { code: "+55", country: "BR", flag: "🇧🇷", label: "Brazil (+55)" },
  { code: "+27", country: "ZA", flag: "🇿🇦", label: "South Africa (+27)" },
  { code: "+82", country: "KR", flag: "🇰🇷", label: "South Korea (+82)" },
  { code: "+62", country: "ID", flag: "🇮🇩", label: "Indonesia (+62)" },
  { code: "+60", country: "MY", flag: "🇲🇾", label: "Malaysia (+60)" },
  { code: "+966", country: "SA", flag: "🇸🇦", label: "Saudi Arabia (+966)" },
  { code: "+234", country: "NG", flag: "🇳🇬", label: "Nigeria (+234)" },
  { code: "+254", country: "KE", flag: "🇰🇪", label: "Kenya (+254)" },
  { code: "+977", country: "NP", flag: "🇳🇵", label: "Nepal (+977)" },
  { code: "+94", country: "LK", flag: "🇱🇰", label: "Sri Lanka (+94)" },
  { code: "+880", country: "BD", flag: "🇧🇩", label: "Bangladesh (+880)" },
];

function getRoleDashboard(role: string): string {
  switch (role) {
    case "OWNER": return "/owner/dashboard";
    case "ADMIN": return "/admin";
    default: return "/guest/explore";
  }
}

export default function LoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("credential");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("phone");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState("");

  // Registration fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regRole, setRegRole] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ─── Send OTP ───────────────────────────────────────────────────────────
  const handleSendOtp = useCallback(async () => {
    setError("");

    let payload: Record<string, string> = {};

    if (loginMethod === "email") {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setError("Please enter a valid email address");
        return;
      }
      payload = { email: cleanEmail };
    } else {
      const cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length < 4 || cleanPhone.length > 14) {
        setError("Please enter a valid phone number");
        return;
      }
      payload = { phone: `${countryCode}${cleanPhone}` };
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to send OTP");
        return;
      }

      if (data.otp) setDevOtp(data.otp);
      setStep("otp");
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [phone, email, countryCode, loginMethod]);

  // ─── OTP Input Handling ─────────────────────────────────────────────────
  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;
      const newOtp = [...otp];
      newOtp[index] = value.slice(-1);
      setOtp(newOtp);
      if (value && index < 5) otpRefs.current[index + 1]?.focus();
      if (value && index === 5 && newOtp.every((d) => d !== "")) {
        handleVerifyOtp(newOtp.join(""));
      }
    },
    [otp]
  );

  const handleOtpKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
      handleVerifyOtp(pasted);
    }
  }, []);

  // ─── Verify OTP ─────────────────────────────────────────────────────────
  const handleVerifyOtp = useCallback(
    async (otpCode?: string) => {
      setError("");
      const code = otpCode || otp.join("");
      if (code.length !== 6) {
        setError("Please enter the complete 6-digit OTP");
        return;
      }

      const payload: Record<string, string> = { otp: code };
      if (loginMethod === "email") {
        payload.email = email.trim().toLowerCase();
      } else {
        payload.phone = `${countryCode}${phone.replace(/\D/g, "")}`;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!data.success) {
          setError(data.error || "Verification failed");
          return;
        }

        if (data.isNewUser) {
          setVerifiedPhone(data.phone || "");
          setVerifiedEmail(data.email || "");
          // Pre-fill registration fields from verified credential
          if (data.email) setRegEmail(data.email);
          if (data.phone) setRegPhone(data.phone);
          setStep("register");
        } else {
          const user = data.user as UserData;
          router.push(getRoleDashboard(user.role));
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [otp, phone, email, countryCode, loginMethod, router]
  );

  // ─── Register ───────────────────────────────────────────────────────────
  const handleRegister = useCallback(async () => {
    setError("");
    if (!regName.trim()) { setError("Name is required"); return; }
    if (!regEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) { setError("Valid email is required"); return; }
    if (!regRole) { setError("Please select a role"); return; }

    // If logged in via email, phone is optional during registration
    // If logged in via phone, email was filled from form
    const phoneToSend = verifiedPhone || (regPhone ? regPhone : undefined);

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim().toLowerCase(),
          phone: phoneToSend || "",
          role: regRole,
        }),
      });

      const data = await res.json();
      if (!data.success) { setError(data.error || "Registration failed"); return; }

      const user = data.user as UserData;
      router.push(getRoleDashboard(user.role));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [regName, regEmail, regPhone, regRole, verifiedPhone, router]);

  const displayCredential = loginMethod === "email"
    ? email
    : `${countryCode} ${phone}`;

  return (
    <div className="rounded-2xl bg-white p-8 shadow-2xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100">
          <Building2 className="h-7 w-7 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">PG Manager</h1>
        <p className="mt-1 text-sm text-gray-500">
          {step === "credential" && "Sign in to manage your PG property"}
          {step === "otp" && `Enter the OTP sent to ${displayCredential}`}
          {step === "register" && "Complete your profile to get started"}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Dev OTP hint */}
      {devOtp && step === "otp" && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Dev mode OTP: <span className="font-mono font-bold">{devOtp}</span>
        </div>
      )}

      {/* ─── Credential Step ─────────────────────────────────────────────── */}
      {step === "credential" && (
        <div className="space-y-5">
          {/* Method Toggle */}
          <div className="flex rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => { setLoginMethod("phone"); setError(""); }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                loginMethod === "phone" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Phone className="h-4 w-4" /> Phone
            </button>
            <button
              onClick={() => { setLoginMethod("email"); setError(""); }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                loginMethod === "email" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Mail className="h-4 w-4" /> Email
            </button>
          </div>

          {loginMethod === "phone" ? (
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="flex">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-2 py-2.5 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <input
                  id="phone"
                  type="tel"
                  maxLength={14}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 14));
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  className="block w-full rounded-r-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">Select your country code for international numbers</p>
            </div>
          ) : (
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <p className="mt-1 text-xs text-gray-400">We&apos;ll send a verification code to this email</p>
            </div>
          )}

          <button
            onClick={handleSendOtp}
            disabled={loading || (loginMethod === "phone" ? phone.length < 4 : email.length < 5)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : loginMethod === "phone" ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
            Send OTP
          </button>
        </div>
      )}

      {/* ─── OTP Step ──────────────────────────────────────────────────────── */}
      {step === "otp" && (
        <div className="space-y-5">
          <div>
            <label className="mb-3 block text-center text-sm font-medium text-gray-700">
              Enter 6-digit OTP
            </label>
            <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="h-12 w-12 rounded-lg border border-gray-300 text-center text-lg font-semibold shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => handleVerifyOtp()}
            disabled={loading || otp.some((d) => !d)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Verify OTP
          </button>

          <button
            onClick={() => {
              setStep("credential");
              setOtp(["", "", "", "", "", ""]);
              setDevOtp("");
              setError("");
            }}
            className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700"
          >
            {loginMethod === "phone" ? "Change phone number" : "Change email"}
          </button>
        </div>
      )}

      {/* ─── Registration Step ─────────────────────────────────────────────── */}
      {step === "register" && (
        <div className="space-y-4">
          <div>
            <label htmlFor="reg-name" className="mb-1.5 block text-sm font-medium text-gray-700">Full Name</label>
            <input
              id="reg-name" type="text" placeholder="Rahul Sharma" value={regName}
              onChange={(e) => { setRegName(e.target.value); setError(""); }}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-gray-700">Email Address</label>
            <input
              id="reg-email" type="email" placeholder="you@example.com" value={regEmail}
              onChange={(e) => { setRegEmail(e.target.value); setError(""); }}
              disabled={!!verifiedEmail}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {/* Show phone field if user signed up via email (so they can optionally add phone) */}
          {verifiedEmail && !verifiedPhone && (
            <div>
              <label htmlFor="reg-phone" className="mb-1.5 block text-sm font-medium text-gray-700">
                Phone Number <span className="text-gray-400">(optional)</span>
              </label>
              <input
                id="reg-phone" type="tel" placeholder="+91 9876543210" value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          )}

          {/* Show verified phone if signed up via phone */}
          {verifiedPhone && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel" value={verifiedPhone} disabled
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-500"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">I am a...</label>
            <div className="space-y-2">
              {ROLE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    regRole === opt.value
                      ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio" name="role" value={opt.value}
                    checked={regRole === opt.value}
                    onChange={() => { setRegRole(opt.value); setError(""); }}
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{opt.label}</div>
                    <div className="text-xs text-gray-500">{opt.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Create Account
          </button>
        </div>
      )}

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-gray-400">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
