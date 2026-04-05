import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import type { Role } from "@prisma/client";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

const VALID_ROLES: Role[] = ["OWNER", "ADMIN", "GUEST", "STAFF"];

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 requests per minute per IP
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const limited = rateLimit(getRateLimitKey(ip, "register"), 5, 60_000);
    if (limited) return limited;

    const body = await req.json();
    const { name, email, phone, role } = body;

    // ─── Validation ────────────────────────────────────────────────────────
    if (!name || !email || !role) {
      return NextResponse.json(
        { success: false, error: "Name, email, and role are required" },
        { status: 400 }
      );
    }

    if (!VALID_ROLES.includes(role as Role)) {
      return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 });
    }

    // Clean phone if provided
    let cleanPhone: string = "";
    if (phone && phone.trim()) {
      cleanPhone = phone.replace(/[^\d+]/g, "");
      if (!cleanPhone.startsWith("+") && cleanPhone.length === 10) {
        cleanPhone = `+91${cleanPhone}`;
      }
      const digitsOnly = cleanPhone.replace(/\D/g, "");
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        return NextResponse.json(
          { success: false, error: "Invalid phone number" },
          { status: 400 }
        );
      }
    }

    // Check for duplicate email or phone
    const orConditions: Array<Record<string, string>> = [{ email }];
    if (cleanPhone) orConditions.push({ phone: cleanPhone });

    const existing = await prisma.user.findFirst({
      where: { OR: orConditions },
    });

    if (existing) {
      const field = existing.email === email ? "email" : "phone";
      return NextResponse.json(
        { success: false, error: `User with this ${field} already exists` },
        { status: 409 }
      );
    }

    // ─── Create user ──────────────────────────────────────────────────────
    const user = await prisma.user.create({
      data: {
        name,
        email,
        ...(cleanPhone && { phone: cleanPhone }),
        role: role as Role,
        isVerified: true,
      },
    });

    // ─── Generate JWT ─────────────────────────────────────────────────────
    const token = await generateToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
        token,
      },
      { status: 201 }
    );

    // Set httpOnly cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ success: false, error: "Failed to register user" }, { status: 500 });
  }
}
