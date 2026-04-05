import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET environment variable is required. Set it in .env.local");
  }
  return new TextEncoder().encode(secret);
}

const SECRET = getJwtSecret();

// Routes that do not require authentication
const PUBLIC_PATHS = ["/login", "/register", "/api/auth"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

async function getTokenPayload(req: NextRequest) {
  // Try cookie first, then Authorization header
  let token = req.cookies.get("token")?.value;

  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      userId: payload.userId as string,
      role: payload.role as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths through
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Static assets and Next.js internals
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const user = await getTokenPayload(req);
  const isApiRoute = pathname.startsWith("/api");

  // ─── Unauthenticated ────────────────────────────────────────────────────
  if (!user) {
    if (isApiRoute) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Role-based access ─────────────────────────────────────────────────
  const role = user.role;

  if (pathname.startsWith("/owner") && role !== "OWNER") {
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Owner access required" },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/admin") && role !== "ADMIN" && role !== "OWNER") {
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/guest") && role !== "GUEST") {
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Guest access required" },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ─── Attach user info to request headers ────────────────────────────────
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", user.userId);
  requestHeaders.set("x-user-role", user.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
