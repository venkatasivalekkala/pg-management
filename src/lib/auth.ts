import { hash, compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TokenPayload {
  userId: string;
  role: string;
  email: string;
}

// ─── Secret ──────────────────────────────────────────────────────────────────

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production"
);

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
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
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
