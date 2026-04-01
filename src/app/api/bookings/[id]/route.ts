import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        guest: { select: { id: true, name: true, email: true, phone: true } },
        room: {
          include: {
            property: { select: { id: true, name: true, city: true, address: true } },
          },
        },
        payments: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
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

    const existing = await prisma.booking.findUnique({
      where: { id },
      include: { room: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, checkOutDate, noticePeriodEnd, agreementUrl, paymentStatus } = body;

    // Handle room occupancy updates based on status transitions
    let roomUpdate: { occupiedBeds?: { increment: number }; status?: string } | undefined;

    if (status && status !== existing.status) {
      if (status === "CONFIRMED" && existing.status === "PENDING") {
        roomUpdate = {
          occupiedBeds: { increment: 1 },
          ...(existing.room.occupiedBeds + 1 >= existing.room.totalBeds
            ? { status: "OCCUPIED" }
            : {}),
        };
      } else if (
        (status === "CANCELLED" || status === "COMPLETED") &&
        (existing.status === "CONFIRMED")
      ) {
        roomUpdate = {
          occupiedBeds: { increment: -1 },
          ...(existing.room.occupiedBeds - 1 <= 0
            ? { status: "VACANT" }
            : {}),
        };
      }
    }

    const [booking] = await prisma.$transaction([
      prisma.booking.update({
        where: { id },
        data: {
          ...(status !== undefined && { status }),
          ...(checkOutDate !== undefined && { checkOutDate: new Date(checkOutDate) }),
          ...(noticePeriodEnd !== undefined && { noticePeriodEnd: new Date(noticePeriodEnd) }),
          ...(agreementUrl !== undefined && { agreementUrl }),
          ...(paymentStatus !== undefined && { paymentStatus }),
        },
        include: {
          guest: { select: { id: true, name: true, email: true, phone: true } },
          room: { select: { id: true, roomNumber: true, floor: true } },
        },
      }),
      ...(roomUpdate
        ? [prisma.room.update({ where: { id: existing.roomId }, data: roomUpdate as any })]
        : []),
    ]);

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
