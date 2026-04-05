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
import { updateBookingSchema, validateBody } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  // ── Auth ────────────────────────────────────────────────────────────────
  const authResult = requireAuth(request);
  if (!isUser(authResult)) return authResult;
  const user = authResult;

  // STAFF has no access to bookings
  if (user.role === "STAFF") return forbidden("Staff cannot access bookings");

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

    if (!booking) return notFound("Booking");

    // ── Access check ──────────────────────────────────────────────────────
    if (user.role === "GUEST") {
      if (booking.guestId !== user.id) return forbidden("You can only view your own bookings");
    } else {
      // ADMIN / OWNER: must have access to the property this booking belongs to
      const propertyIds = await getUserPropertyIds(user);
      if (!propertyIds.includes(booking.room.propertyId)) {
        return forbidden("You do not have access to this booking");
      }
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  // ── Auth ────────────────────────────────────────────────────────────────
  const authResult = requireAuth(request);
  if (!isUser(authResult)) return authResult;
  const user = authResult;

  // STAFF has no access to bookings
  if (user.role === "STAFF") return forbidden("Staff cannot update bookings");

  try {
    const { id } = await context.params;

    const existing = await prisma.booking.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!existing) return notFound("Booking");

    // ── Access check ──────────────────────────────────────────────────────
    if (user.role === "GUEST") {
      if (existing.guestId !== user.id) {
        return forbidden("You can only update your own bookings");
      }
    } else {
      // ADMIN / OWNER: must have access to the property this booking belongs to
      const propertyIds = await getUserPropertyIds(user);
      if (!propertyIds.includes(existing.room.propertyId)) {
        return forbidden("You do not have access to this booking");
      }
    }

    // ── Validate body ────────────────────────────────────────────────────
    const body = await request.json();
    const validation = validateBody(updateBookingSchema, body);
    if (validation.error) return badRequest(validation.error);
    const data = validation.data!;

    // ── GUEST: cancellation only ──────────────────────────────────────────
    if (user.role === "GUEST") {
      const allowedStatuses = ["CANCELLED"] as const;
      if (data.status !== undefined && !allowedStatuses.includes(data.status as "CANCELLED")) {
        return forbidden("Guests can only cancel their bookings");
      }
      // Guests may not change fields other than status (cancellation)
      if (
        data.checkOutDate !== undefined ||
        data.agreementUrl !== undefined ||
        data.bedNumber !== undefined
      ) {
        return forbidden("Guests can only cancel their bookings");
      }
    }

    const { status } = data;

    // ── Handle room occupancy updates based on status transitions ─────────
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
        existing.status === "CONFIRMED"
      ) {
        roomUpdate = {
          occupiedBeds: { increment: -1 },
          ...(existing.room.occupiedBeds - 1 <= 0 ? { status: "VACANT" } : {}),
        };
      }
    }

    const [booking] = await prisma.$transaction([
      prisma.booking.update({
        where: { id },
        data: {
          ...(status !== undefined && { status }),
          ...(data.checkOutDate !== undefined && { checkOutDate: new Date(data.checkOutDate) }),
          ...(data.agreementUrl !== undefined && { agreementUrl: data.agreementUrl }),
          ...(data.bedNumber !== undefined && { bedNumber: data.bedNumber }),
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
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
