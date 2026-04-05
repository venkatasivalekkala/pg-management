import { NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt < now) store.delete(key);
    }
  },
  5 * 60 * 1000
);

/**
 * In-memory rate limiter. Returns null if allowed, or a 429 response if exceeded.
 *
 * @param key - Unique identifier (e.g., IP + route)
 * @param maxRequests - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 */
export function rateLimit(key: string, maxRequests: number, windowMs: number): NextResponse | null {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  entry.count++;

  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": retryAfter.toString() },
      }
    );
  }

  return null;
}

/**
 * Get a rate limit key from request IP + path prefix.
 */
export function getRateLimitKey(ip: string | null, prefix: string): string {
  return `${prefix}:${ip || "unknown"}`;
}
