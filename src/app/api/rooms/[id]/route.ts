import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  requireAuth,
  requireRole,
  isUser,
  hasPropertyAccess,
  notFound,
  forbidden,
  badRequest,
} from "@/lib/authorization";
import { updateRoomSchema, validateBody } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // Require authentication for all roles
    const authResult = requireAuth(request);
    if (!isUser(authResult)) return authResult;
    const user = authResult;

    const { id } = await context.params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        property: { select: { id: true, name: true, city: true } },
        bookings: {
          where: {
            status: { in: ["PENDING", "CONFIRMED"] },
          },
          include: {
            guest: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
      },
    });

    if (!room) {
      return notFound("Room");
    }

    // Verify the user has access to the property this room belongs to
    const accessible = await hasPropertyAccess(user, room.propertyId);
    if (!accessible) {
      return forbidden("You do not have access to this room");
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json({ error: "Failed to fetch room" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    // Only ADMIN and OWNER may update rooms
    const authResult = requireRole(request, "ADMIN", "OWNER");
    if (!isUser(authResult)) return authResult;
    const user = authResult;

    const { id } = await context.params;

    const existing = await prisma.room.findUnique({ where: { id } });
    if (!existing) {
      return notFound("Room");
    }

    // Verify the user has access to the property this room belongs to
    const accessible = await hasPropertyAccess(user, existing.propertyId);
    if (!accessible) {
      return forbidden("You do not have access to this room");
    }

    const body = await request.json();
    const validation = validateBody(updateRoomSchema, body);
    if (validation.error) {
      return badRequest(validation.error);
    }
    const data = validation.data!;

    const room = await prisma.room.update({
      where: { id },
      data,
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json({ error: "Failed to update room" }, { status: 500 });
  }
}
