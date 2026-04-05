import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  requireAuth,
  isUser,
  getUserPropertyIds,
  hasPropertyAccess,
  forbidden,
  notFound,
  badRequest,
} from "@/lib/authorization";
import { updateVisitorSchema, validateBody } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const authResult = requireAuth(request);
  if (!isUser(authResult)) return authResult;
  const user = authResult;

  try {
    const { id } = await context.params;

    const visitor = await prisma.visitor.findUnique({
      where: { id },
      include: {
        guest: { select: { id: true, name: true, email: true, phone: true } },
        property: { select: { id: true, name: true, city: true, address: true } },
        approver: { select: { id: true, name: true } },
      },
    });

    if (!visitor) return notFound("Visitor");

    if (user.role === "GUEST") {
      // GUESTs may only view their own visitor records
      if (visitor.guestId !== user.id) {
        return forbidden("You do not have access to this visitor record");
      }
    } else {
      // ADMIN, OWNER, STAFF: must have access to the visitor's property
      const accessiblePropertyIds = await getUserPropertyIds(user);
      if (!accessiblePropertyIds.includes(visitor.propertyId)) {
        return forbidden("You do not have access to this visitor record");
      }
    }

    return NextResponse.json(visitor);
  } catch (error) {
    console.error("Error fetching visitor:", error);
    return NextResponse.json({ error: "Failed to fetch visitor" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const authResult = requireAuth(request);
  if (!isUser(authResult)) return authResult;
  const user = authResult;

  try {
    const { id } = await context.params;

    const existing = await prisma.visitor.findUnique({ where: { id } });
    if (!existing) return notFound("Visitor");

    const body = await request.json();
    const validation = validateBody(updateVisitorSchema, body);
    if (validation.error) return badRequest(validation.error);
    const { status, approvedBy, entryTime, exitTime } = validation.data!;

    if (user.role === "GUEST") {
      // GUESTs may only cancel their own visitor registration (status → DENIED)
      if (existing.guestId !== user.id) {
        return forbidden("You do not have access to this visitor record");
      }
      if (status !== undefined && status !== "DENIED") {
        return forbidden("Guests may only cancel (deny) their own visitor registrations");
      }
    } else {
      // ADMIN, OWNER, STAFF: must have access to the visitor's property
      const hasAccess = await hasPropertyAccess(user, existing.propertyId);
      if (!hasAccess) {
        return forbidden("You do not have access to this visitor record");
      }
    }

    const updateData: Record<string, unknown> = {};

    if (user.role === "GUEST") {
      // For guests, only allow setting status to DENIED
      if (status !== undefined) updateData.status = status;
    } else {
      // ADMIN / OWNER / STAFF: full update of status and times
      if (status !== undefined) {
        updateData.status = status;

        if (status === "CHECKED_IN" && !existing.entryTime && !entryTime) {
          updateData.entryTime = new Date();
        }
        if (status === "CHECKED_OUT" && !existing.exitTime && !exitTime) {
          updateData.exitTime = new Date();
        }
      }

      if (approvedBy !== undefined) updateData.approvedBy = approvedBy;
      if (entryTime !== undefined) updateData.entryTime = new Date(entryTime);
      if (exitTime !== undefined) updateData.exitTime = new Date(exitTime);
    }

    const visitor = await prisma.visitor.update({
      where: { id },
      data: updateData,
      include: {
        guest: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(visitor);
  } catch (error) {
    console.error("Error updating visitor:", error);
    return NextResponse.json({ error: "Failed to update visitor" }, { status: 500 });
  }
}
