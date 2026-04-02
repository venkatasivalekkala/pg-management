import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { NoticePeriodStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const bookingId = searchParams.get("bookingId");
    const guestId = searchParams.get("guestId");
    const status = searchParams.get("status") as NoticePeriodStatus | null;

    const where: Record<string, unknown> = {};
    if (bookingId) where.bookingId = bookingId;
    if (guestId) where.guestId = guestId;
    if (status) where.status = status;

    const noticePeriods = await prisma.noticePeriod.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        guest: { select: { id: true, name: true, email: true } },
        booking: {
          select: {
            id: true,
            checkInDate: true,
            checkOutDate: true,
            status: true,
            room: { select: { id: true, roomNumber: true } },
          },
        },
      },
    });

    return NextResponse.json({ data: noticePeriods });
  } catch (error) {
    console.error("Error listing notice periods:", error);
    return NextResponse.json(
      { error: "Failed to list notice periods" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (user.role !== "GUEST") {
      return NextResponse.json(
        { error: "Only guests can create notice period requests" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { bookingId, noticeDays, expectedEndDate, reason } = body;

    if (!bookingId || !expectedEndDate) {
      return NextResponse.json(
        { error: "Missing required fields: bookingId, expectedEndDate" },
        { status: 400 }
      );
    }

    const noticePeriod = await prisma.noticePeriod.create({
      data: {
        bookingId,
        guestId: user.id,
        noticeDays: noticeDays || 30,
        expectedEndDate: new Date(expectedEndDate),
        reason,
      },
      include: {
        guest: { select: { id: true, name: true, email: true } },
        booking: {
          select: {
            id: true,
            checkInDate: true,
            checkOutDate: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(noticePeriod, { status: 201 });
  } catch (error) {
    console.error("Error creating notice period:", error);
    return NextResponse.json(
      { error: "Failed to create notice period" },
      { status: 500 }
    );
  }
}
