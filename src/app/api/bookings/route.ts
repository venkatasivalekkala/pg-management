import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import {
  requireAuth,
  isUser,
  getUserPropertyIds,
  forbidden,
  badRequest,
} from "@/lib/authorization";
import { createBookingSchema, validateBody } from "@/lib/validations";

export async function GET(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────
  const authResult = requireAuth(request);
  if (!isUser(authResult)) return authResult;
  const user = authResult;

  // STAFF has no access to bookings
  if (user.role === "STAFF") return forbidden("Staff cannot access bookings");

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const status = searchParams.get("status") as BookingStatus | null;

    // ── Build role-scoped where clause ───────────────────────────────────
    const where: Record<string, unknown> = {};

    if (status) where.status = status;

    if (user.role === "GUEST") {
      // Guests only see their own bookings; ignore any caller-supplied guestId filter
      where.guestId = user.id;
    } else {
      // ADMIN / OWNER: scope to rooms belonging to their accessible properties
      const propertyIds = await getUserPropertyIds(user);
      where.room = { propertyId: { in: propertyIds } };

      // Allow optional further narrowing by a specific propertyId query param
      const propertyId = searchParams.get("propertyId");
      if (propertyId) {
        if (!propertyIds.includes(propertyId)) {
          return forbidden("You do not have access to this property");
        }
        where.room = { propertyId };
      }

      // Allow optional further narrowing by guestId query param
      const guestId = searchParams.get("guestId");
      if (guestId) where.guestId = guestId;
    }

    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          guest: { select: { id: true, name: true, email: true, phone: true } },
          room: {
            select: {
              id: true,
              roomNumber: true,
              floor: true,
              property: { select: { id: true, name: true } },
            },
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
    return NextResponse.json({ error: "Failed to list bookings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────
  const authResult = requireAuth(request);
  if (!isUser(authResult)) return authResult;
  const user = authResult;

  // STAFF has no access to bookings
  if (user.role === "STAFF") return forbidden("Staff cannot create bookings");

  try {
    const body = await request.json();

    // ── Validate body ────────────────────────────────────────────────────
    const validation = validateBody(createBookingSchema, body);
    if (validation.error) return badRequest(validation.error);
    const data = validation.data!;

    // ── Role-based guestId & property scoping ────────────────────────────
    let resolvedGuestId: string;

    if (user.role === "GUEST") {
      // Guests can only create bookings for themselves
      resolvedGuestId = user.id;
    } else {
      // ADMIN / OWNER: use the guestId from the validated body
      resolvedGuestId = data.guestId;
    }

    // ── Room availability checks ─────────────────────────────────────────
    const room = await prisma.room.findUnique({ where: { id: data.roomId } });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.status === "MAINTENANCE") {
      return NextResponse.json({ error: "Room is under maintenance" }, { status: 400 });
    }

    if (room.occupiedBeds >= room.totalBeds) {
      return NextResponse.json(
        { error: "Room is fully occupied, no beds available" },
        { status: 400 }
      );
    }

    // ── Property access check for ADMIN / OWNER ──────────────────────────
    if (user.role === "ADMIN" || user.role === "OWNER") {
      const propertyIds = await getUserPropertyIds(user);
      if (!propertyIds.includes(room.propertyId)) {
        return forbidden("You do not have access to this property");
      }
    }

    const booking = await prisma.booking.create({
      data: {
        guestId: resolvedGuestId,
        roomId: data.roomId,
        bedNumber: data.bedNumber,
        checkInDate: new Date(data.checkInDate),
        checkOutDate: data.checkOutDate ? new Date(data.checkOutDate) : null,
        bookingAmount: data.bookingAmount,
        securityDeposit: data.securityDeposit,
        rentAmount: data.rentAmount,
      },
      include: {
        guest: { select: { id: true, name: true, email: true, phone: true } },
        room: { select: { id: true, roomNumber: true, floor: true } },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
