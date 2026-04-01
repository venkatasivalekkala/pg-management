import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const propertyId = searchParams.get("propertyId");
    const guestId = searchParams.get("guestId");
    const status = searchParams.get("status") as BookingStatus | null;

    const where: Record<string, unknown> = {};
    if (propertyId) where.room = { propertyId };
    if (guestId) where.guestId = guestId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          guest: { select: { id: true, name: true, email: true, phone: true } },
          room: {
            select: { id: true, roomNumber: true, floor: true, property: { select: { id: true, name: true } } },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error listing bookings:", error);
    return NextResponse.json(
      { error: "Failed to list bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestId, roomId, bedNumber, checkInDate, checkOutDate, bookingAmount, securityDeposit, rentAmount } = body;

    if (!guestId || !roomId || !checkInDate || !bookingAmount || !securityDeposit || !rentAmount) {
      return NextResponse.json(
        { error: "Missing required fields: guestId, roomId, checkInDate, bookingAmount, securityDeposit, rentAmount" },
        { status: 400 }
      );
    }

    // Check room availability
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    if (room.status === "MAINTENANCE") {
      return NextResponse.json(
        { error: "Room is under maintenance" },
        { status: 400 }
      );
    }

    if (room.occupiedBeds >= room.totalBeds) {
      return NextResponse.json(
        { error: "Room is fully occupied, no beds available" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        guestId,
        roomId,
        bedNumber,
        checkInDate: new Date(checkInDate),
        checkOutDate: checkOutDate ? new Date(checkOutDate) : null,
        bookingAmount,
        securityDeposit,
        rentAmount,
      },
      include: {
        guest: { select: { id: true, name: true, email: true, phone: true } },
        room: { select: { id: true, roomNumber: true, floor: true } },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
