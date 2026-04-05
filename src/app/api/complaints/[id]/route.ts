import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  requireAuth,
  isUser,
  getUserPropertyIds,
  forbidden,
  notFound,
  badRequest,
} from "@/lib/authorization";
import { updateComplaintSchema, validateBody } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // ── Auth ─────────────────────────────────────────────────────────────────
    const result = requireAuth(request);
    if (!isUser(result)) return result;
    const user = result;

    const { id } = await context.params;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        guest: { select: { id: true, name: true, email: true, phone: true } },
        property: { select: { id: true, name: true, city: true, address: true } },
        room: { select: { id: true, roomNumber: true, floor: true } },
        assignee: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!complaint) return notFound("Complaint");

    // ── Role-based access check ───────────────────────────────────────────────
    if (user.role === "GUEST") {
      if (complaint.guestId !== user.id) return forbidden();
    } else if (user.role === "STAFF") {
      if (complaint.assignedTo !== user.id) return forbidden();
    } else {
      // ADMIN / OWNER: must be one of their properties
      const accessiblePropertyIds = await getUserPropertyIds(user);
      if (!accessiblePropertyIds.includes(complaint.propertyId)) {
        return forbidden();
      }
    }

    return NextResponse.json(complaint);
  } catch (error) {
    console.error("Error fetching complaint:", error);
    return NextResponse.json({ error: "Failed to fetch complaint" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    // ── Auth ─────────────────────────────────────────────────────────────────
    const result = requireAuth(request);
    if (!isUser(result)) return result;
    const user = result;

    const { id } = await context.params;

    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing) return notFound("Complaint");

    // ── Validate body ─────────────────────────────────────────────────────────
    const body = await request.json();
    const validation = validateBody(updateComplaintSchema, body);
    if (validation.error) return badRequest(validation.error);
    const { status, priority, assignedTo, satisfactionRating } = validation.data!;

    // ── Role-based access + field restrictions ────────────────────────────────
    if (user.role === "GUEST") {
      // Guests: own complaints only, and may only set satisfactionRating
      if (existing.guestId !== user.id) return forbidden();

      if (status !== undefined || priority !== undefined || assignedTo !== undefined) {
        return forbidden("Guests can only update satisfactionRating");
      }
    } else if (user.role === "STAFF") {
      // Staff: assigned complaints only, and may only update status
      if (existing.assignedTo !== user.id) return forbidden();

      if (priority !== undefined || assignedTo !== undefined || satisfactionRating !== undefined) {
        return forbidden("Staff can only update status");
      }
    } else {
      // ADMIN / OWNER: must be one of their properties; can update any field
      const accessiblePropertyIds = await getUserPropertyIds(user);
      if (!accessiblePropertyIds.includes(existing.propertyId)) {
        return forbidden();
      }
    }

    // ── Update ────────────────────────────────────────────────────────────────
    const complaint = await prisma.complaint.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(satisfactionRating !== undefined && { satisfactionRating }),
        ...(status === "RESOLVED" && !existing.resolvedAt ? { resolvedAt: new Date() } : {}),
      },
      include: {
        guest: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(complaint);
  } catch (error) {
    console.error("Error updating complaint:", error);
    return NextResponse.json({ error: "Failed to update complaint" }, { status: 500 });
  }
}
