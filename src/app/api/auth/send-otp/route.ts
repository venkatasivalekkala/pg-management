import { NextRequest, NextResponse } from "next/server";
import { generateOTP } from "@/lib/auth";
import { isDemoIdentifier, DEMO_OTP } from "@/lib/demo-accounts";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function cleanPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.length === 10) return `+91${cleaned}`;
  return cleaned;
}

function isValidPhone(phone: string): boolean {
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 requests per minute per IP
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const limited = rateLimit(getRateLimitKey(ip, "send-otp"), 5, 60_000);
    if (limited) return limited;

    const body = await req.json();
    const { phone, email } = body;

    if (!phone && !email) {
      return NextResponse.json(
        { success: false, error: "Phone number or email is required" },
        { status: 400 }
      );
    }

    let identifier: { phone?: string; email?: string } = {};

    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      if (!isEmail(cleanEmail)) {
        return NextResponse.json(
          { success: false, error: "Invalid email address" },
          { status: 400 }
        );
      }
      identifier = { email: cleanEmail };
    } else {
      const cleanPhone = cleanPhoneNumber(phone);
      if (!isValidPhone(cleanPhone)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid phone number. Include country code for international numbers.",
          },
          { status: 400 }
        );
      }
      identifier = { phone: cleanPhone };
    }

    // ─── Demo account bypass (no DB needed) ────────────────────────────
    if (isDemoIdentifier(identifier)) {
      return NextResponse.json({
        success: true,
        message: identifier.email ? "OTP sent to your email" : "OTP sent to your phone",
        otp: DEMO_OTP, // Always show for demo
        demo: true,
      });
    }

    // ─── Real flow (requires database) ─────────────────────────────────
    try {
      const prisma = (await import("@/lib/prisma")).default;

      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await prisma.otpVerification.updateMany({
        where: { ...identifier, isUsed: false },
        data: { isUsed: true },
      });

      await prisma.otpVerification.create({
        data: { ...identifier, otp, expiresAt },
      });

      const isDev = process.env.NODE_ENV === "development";

      return NextResponse.json({
        success: true,
        message: identifier.email ? "OTP sent to your email" : "OTP sent to your phone",
        ...(isDev && { otp }),
      });
    } catch (dbError) {
      // Database not available — return helpful error
      console.error("Database error:", dbError);
      return NextResponse.json(
        {
          success: false,
          error:
            "Database not connected. Use demo accounts to test: owner@demo.com, admin@demo.com, or guest@demo.com (OTP: 123456)",
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ success: false, error: "Failed to send OTP" }, { status: 500 });
  }
}
