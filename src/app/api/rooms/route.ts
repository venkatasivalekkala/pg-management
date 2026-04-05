import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { RoomStatus, RoomType } from "@prisma/client";
import {
  requireAuth,
  requireRole,
  isUser,
  getUserPropertyIds,
  hasPropertyAccess,
  badRequest,
  notFound,
  forbidden,
} from "@/lib/authorization";
import { createRoomSchema, validateBody } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    // Require authentication for all roles
    const authResult = requireAuth(request);
    if (!isUser(authResult)) return authResult;
    const user = authResult;

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const propertyId = searchParams.get("propertyId");
    if (!propertyId) {
      return badRequest("propertyId is required");
    }

    // Verify the requesting user has access to this property
    const accessible = await hasPropertyAccess(user, propertyId);
    if (!accessible) {
      return forbidden("You do not have access to this property");
    }

    const status = searchParams.get("status") as RoomStatus | null;
    const roomType = searchParams.get("roomType") as RoomType | null;
    const floor = searchParams.get("floor");

    const where: Record<string, unknown> = { propertyId };
    if (status) where.status = status;
    if (roomType) where.roomType = roomType;
    if (floor) where.floor = parseInt(floor);

    const [data, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take: limit,
        orderBy: { roomNumber: "asc" },
      }),
      prisma.room.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error listing rooms:", error);
    return NextResponse.json({ error: "Failed to list rooms" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only ADMIN and OWNER may create rooms
    const authResult = requireRole(request, "ADMIN", "OWNER");
    if (!isUser(authResult)) return authResult;
    const user = authResult;

    const body = await request.json();
    const validation = validateBody(createRoomSchema, body);
    if (validation.error) {
      return badRequest(validation.error);
    }
    const data = validation.data!;

    // Verify the property exists and belongs to this user's accessible properties
    const property = await prisma.property.findUnique({
      where: { id: data.propertyId },
    });
    if (!property) {
      return notFound("Property");
    }

    const accessible = await hasPropertyAccess(user, data.propertyId);
    if (!accessible) {
      return forbidden("You do not have access to this property");
    }

    const room = await prisma.room.create({ data });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
