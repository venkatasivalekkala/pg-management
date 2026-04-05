import { hash, compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TokenPayload {
  userId: string;
  role: string;
  email: string;
}

export interface AuthUser {
  id: string;
  role: string;
  email: string;
  name: string;
}

// ─── Secret ──────────────────────────────────────────────────────────────────

function getJwtSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET environment variable is required. Set it in .env.local");
  }
  return new TextEncoder().encode(secret);
}

const SECRET = getJwtSecret();

// ─── OTP ─────────────────────────────────────────────────────────────────────

/**
 * Generate a random 6-digit OTP.
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Password Hashing ────────────────────────────────────────────────────────

/**
 * Hash a plaintext password with bcryptjs (10 salt rounds).
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

/**
 * Compare a plaintext password against a bcrypt hash.
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

// ─── JWT ─────────────────────────────────────────────────────────────────────

/**
 * Generate a JWT (HS256) containing userId, role, and email.
 * Expires in 7 days.
 */
export async function generateToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

/**
 * Verify and decode a JWT. Returns the payload or throws on failure.
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, SECRET);
  return {
    userId: payload.userId as string,
    role: payload.role as string,
    email: payload.email as string,
  };
}

// ─── Request Auth ───────────────────────────────────────────────────────────

/**
 * Extract and verify the Bearer token from a request, then look up the user.
 * Returns { id, role, email, name } or null if unauthenticated.
 */
export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    // Check Bearer token first, then fall back to cookie
    let token: string | null = null;
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else {
      token = request.cookies.get("token")?.value || null;
    }
    if (!token) return null;
    const decoded = await verifyToken(token);

    // Lazy-import prisma to avoid circular dependency issues
    const { default: prisma } = await import("@/lib/prisma");

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, email: true, name: true },
    });

    if (!user || !user.name) return null;

    return { id: user.id, role: user.role, email: user.email, name: user.name };
  } catch {
    return null;
  }
}
