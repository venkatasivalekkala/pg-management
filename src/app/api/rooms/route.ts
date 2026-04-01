import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { RoomStatus, RoomType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const propertyId = searchParams.get("propertyId");
    if (!propertyId) {
      return NextResponse.json(
        { error: "propertyId is required" },
        { status: 400 }
      );
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
    return NextResponse.json(
      { error: "Failed to list rooms" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, roomNumber, floor, roomType, sharingType, monthlyRent, dailyRent, totalBeds, amenities } = body;

    if (!propertyId || !roomNumber || floor === undefined || !roomType || !sharingType || !monthlyRent || !totalBeds) {
      return NextResponse.json(
        { error: "Missing required fields: propertyId, roomNumber, floor, roomType, sharingType, monthlyRent, totalBeds" },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const room = await prisma.room.create({
      data: {
        propertyId,
        roomNumber,
        floor,
        roomType,
        sharingType,
        monthlyRent,
        dailyRent,
        totalBeds,
        amenities,
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
