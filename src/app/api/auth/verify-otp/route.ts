import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/lib/auth";
import { findDemoAccount, DEMO_OTP } from "@/lib/demo-accounts";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

function cleanPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.length === 10) return `+91${cleaned}`;
  return cleaned;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 requests per minute per IP
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const limited = rateLimit(getRateLimitKey(ip, "verify-otp"), 5, 60_000);
    if (limited) return limited;

    const body = await req.json();
    const { phone, email, otp } = body;

    if ((!phone && !email) || !otp) {
      return NextResponse.json(
        { success: false, error: "Phone/email and OTP are required" },
        { status: 400 }
      );
    }

    let identifier: { phone?: string; email?: string } = {};
    if (email) {
      identifier = { email: email.trim().toLowerCase() };
    } else {
      identifier = { phone: cleanPhoneNumber(phone) };
    }

    // ─── Demo account bypass (no DB needed) ────────────────────────────
    const demoAccount = findDemoAccount(identifier);
    if (demoAccount) {
      if (otp !== DEMO_OTP) {
        return NextResponse.json(
          { success: false, error: "Invalid OTP. Demo OTP is 123456" },
          { status: 400 }
        );
      }

      const token = await generateToken({
        userId: demoAccount.id,
        role: demoAccount.role,
        email: demoAccount.email,
      });

      const response = NextResponse.json({
        success: true,
        isNewUser: false,
        user: {
          id: demoAccount.id,
          name: demoAccount.name,
          email: demoAccount.email,
          phone: demoAccount.phone,
          role: demoAccount.role,
          avatarUrl: demoAccount.avatarUrl,
        },
        token,
        demo: true,
      });

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }

    // ─── Real flow (requires database) ─────────────────────────────────
    try {
      const prisma = (await import("@/lib/prisma")).default;

      const otpRecord = await prisma.otpVerification.findFirst({
        where: {
          ...identifier,
          otp,
          isUsed: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!otpRecord) {
        return NextResponse.json(
          { success: false, error: "Invalid or expired OTP" },
          { status: 400 }
        );
      }

      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });

      const existingUser = identifier.email
        ? await prisma.user.findUnique({ where: { email: identifier.email } })
        : await prisma.user.findUnique({ where: { phone: identifier.phone! } });

      if (!existingUser) {
        return NextResponse.json({
          success: true,
          isNewUser: true,
          phone: identifier.phone || null,
          email: identifier.email || null,
          message: "OTP verified. Please complete registration.",
        });
      }

      const token = await generateToken({
        userId: existingUser.id,
        role: existingUser.role,
        email: existingUser.email,
      });

      const response = NextResponse.json({
        success: true,
        isNewUser: false,
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          phone: existingUser.phone,
          role: existingUser.role,
          avatarUrl: existingUser.avatarUrl,
        },
        token,
      });

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        {
          success: false,
          error:
            "Database not connected. Use demo accounts: owner@demo.com, admin@demo.com, guest@demo.com (OTP: 123456)",
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ success: false, error: "Failed to verify OTP" }, { status: 500 });
  }
}
