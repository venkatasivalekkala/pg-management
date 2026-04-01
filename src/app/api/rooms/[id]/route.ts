import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
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
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const existing = await prisma.room.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { roomNumber, floor, roomType, sharingType, monthlyRent, dailyRent, status, totalBeds, occupiedBeds, amenities } = body;

    const room = await prisma.room.update({
      where: { id },
      data: {
        ...(roomNumber !== undefined && { roomNumber }),
        ...(floor !== undefined && { floor }),
        ...(roomType !== undefined && { roomType }),
        ...(sharingType !== undefined && { sharingType }),
        ...(monthlyRent !== undefined && { monthlyRent }),
        ...(dailyRent !== undefined && { dailyRent }),
        ...(status !== undefined && { status }),
        ...(totalBeds !== undefined && { totalBeds }),
        ...(occupiedBeds !== undefined && { occupiedBeds }),
        ...(amenities !== undefined && { amenities }),
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
}
