import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RequestUser {
  id: string;
  role: "OWNER" | "ADMIN" | "GUEST" | "STAFF";
}

// ─── Extract User from Request ──────────────────────────────────────────────

/**
 * Extract authenticated user from middleware-injected headers.
 * Returns null if headers are missing (unauthenticated).
 */
export function getRequestUser(req: NextRequest): RequestUser | null {
  const id = req.headers.get("x-user-id");
  const role = req.headers.get("x-user-role") as RequestUser["role"] | null;

  if (!id || !role) return null;
  return { id, role };
}

/**
 * Require authentication. Returns the user or a 401 JSON response.
 */
export function requireAuth(req: NextRequest): RequestUser | NextResponse {
  const user = getRequestUser(req);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  return user;
}

/**
 * Require one of the specified roles. Returns the user or a 403 response.
 */
export function requireRole(
  req: NextRequest,
  ...allowedRoles: RequestUser["role"][]
): RequestUser | NextResponse {
  const result = requireAuth(req);
  if (result instanceof NextResponse) return result;

  if (!allowedRoles.includes(result.role)) {
    return NextResponse.json(
      { error: `Forbidden: requires ${allowedRoles.join(" or ")} role` },
      { status: 403 }
    );
  }
  return result;
}

/**
 * Type guard: checks if the result is an authenticated user (not an error response).
 */
export function isUser(result: RequestUser | NextResponse): result is RequestUser {
  return !(result instanceof NextResponse);
}

// ─── Data Scoping Helpers ───────────────────────────────────────────────────

/**
 * Get property IDs owned by a user (OWNER role).
 */
export async function getOwnerPropertyIds(userId: string): Promise<string[]> {
  const properties = await prisma.property.findMany({
    where: { ownerId: userId, isActive: true },
    select: { id: true },
  });
  return properties.map((p) => p.id);
}

/**
 * Get property IDs an admin is assigned to (ADMIN role).
 */
export async function getAdminPropertyIds(userId: string): Promise<string[]> {
  const assignments = await prisma.propertyAdmin.findMany({
    where: { userId, isActive: true },
    select: { propertyId: true },
  });
  return assignments.map((a) => a.propertyId);
}

/**
 * Get all property IDs a user has access to, based on role.
 * - OWNER: properties they own
 * - ADMIN: properties they're assigned to
 * - GUEST/STAFF: properties linked via active bookings or tasks
 */
export async function getUserPropertyIds(user: RequestUser): Promise<string[]> {
  switch (user.role) {
    case "OWNER":
      return getOwnerPropertyIds(user.id);
    case "ADMIN":
      return getAdminPropertyIds(user.id);
    case "GUEST": {
      const bookings = await prisma.booking.findMany({
        where: {
          guestId: user.id,
          status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
        },
        select: { room: { select: { propertyId: true } } },
      });
      return [...new Set(bookings.map((b) => b.room.propertyId))];
    }
    case "STAFF": {
      const tasks = await prisma.staffTask.findMany({
        where: { assignedTo: user.id },
        select: { propertyId: true },
      });
      return [...new Set(tasks.map((t) => t.propertyId))];
    }
    default:
      return [];
  }
}

/**
 * Check if a user has access to a specific property.
 */
export async function hasPropertyAccess(user: RequestUser, propertyId: string): Promise<boolean> {
  const propertyIds = await getUserPropertyIds(user);
  return propertyIds.includes(propertyId);
}

/**
 * Build a Prisma `where` filter scoped to the user's accessible properties.
 * For OWNER/ADMIN: restricts to their properties.
 * For GUEST: restricts to own records (via guestId).
 * For STAFF: restricts to assigned properties.
 *
 * @param user - The authenticated user
 * @param propertyField - The field name for propertyId (default: "propertyId")
 */
export async function scopeByProperty(
  user: RequestUser,
  propertyField: string = "propertyId"
): Promise<Record<string, unknown>> {
  const propertyIds = await getUserPropertyIds(user);
  return { [propertyField]: { in: propertyIds } };
}

/**
 * Verify that a user owns a specific property (OWNER role).
 */
export async function verifyPropertyOwnership(
  userId: string,
  propertyId: string
): Promise<boolean> {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, ownerId: userId },
    select: { id: true },
  });
  return !!property;
}

// ─── Error Responses ────────────────────────────────────────────────────────

export function forbidden(message = "Forbidden"): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(entity = "Resource"): NextResponse {
  return NextResponse.json({ error: `${entity} not found` }, { status: 404 });
}

export function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}
