import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PaymentStatus, PaymentType } from "@prisma/client";
import {
  requireAuth,
  isUser,
  getUserPropertyIds,
  forbidden,
  notFound,
  badRequest,
} from "@/lib/authorization";
import { createPaymentSchema, validateBody } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────
    const authResult = requireAuth(request);
    if (!isUser(authResult)) return authResult;
    const user = authResult;

    // STAFF have no access to payments
    if (user.role === "STAFF") {
      return forbidden("Staff are not permitted to view payments");
    }

    // ── Query params ──────────────────────────────────────────────────────
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const bookingId = searchParams.get("bookingId");
    const status = searchParams.get("status") as PaymentStatus | null;
    const type = searchParams.get("type") as PaymentType | null;
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    // ── Base filter ───────────────────────────────────────────────────────
    const where: Record<string, unknown> = {};
    if (bookingId) where.bookingId = bookingId;
    if (status) where.status = status;
    if (type) where.type = type;
    if (fromDate || toDate) {
      where.dueDate = {
        ...(fromDate ? { gte: new Date(fromDate) } : {}),
        ...(toDate ? { lte: new Date(toDate) } : {}),
      };
    }

    // ── Scope by role ─────────────────────────────────────────────────────
    if (user.role === "GUEST") {
      // GUESTs only see payments for their own bookings
      where.booking = { guestId: user.id };
    } else {
      // ADMIN / OWNER: scope to properties they manage
      const propertyIds = await getUserPropertyIds(user);
      where.booking = {
        room: { propertyId: { in: propertyIds } },
      };
    }

    // ── Query ─────────────────────────────────────────────────────────────
    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          booking: {
            select: {
              id: true,
              guest: { select: { id: true, name: true, email: true } },
              room: {
                select: {
                  id: true,
                  roomNumber: true,
                  property: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error listing payments:", error);
    return NextResponse.json({ error: "Failed to list payments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────
    const authResult = requireAuth(request);
    if (!isUser(authResult)) return authResult;
    const user = authResult;

    // Only ADMIN / OWNER can create payments
    if (user.role !== "ADMIN" && user.role !== "OWNER") {
      return forbidden("Only admins and owners can create payments");
    }

    // ── Validate body ──────────────────────────────────────────────────────
    const body = await request.json();
    const validation = validateBody(createPaymentSchema, body);
    if (validation.error) {
      return badRequest(validation.error);
    }
    const { bookingId, amount, currency, type, method, dueDate, gatewayTxnId, invoiceUrl } =
      validation.data!;

    // ── Booking existence + property access check ─────────────────────────
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, room: { select: { propertyId: true } } },
    });
    if (!booking) {
      return notFound("Booking");
    }

    const propertyIds = await getUserPropertyIds(user);
    if (!propertyIds.includes(booking.room.propertyId)) {
      return forbidden("You do not manage the property for this booking");
    }

    // ── Create ─────────────────────────────────────────────────────────────
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount,
        currency: currency ?? "INR",
        type,
        method,
        dueDate: new Date(dueDate),
        gatewayTxnId,
        invoiceUrl,
      },
      include: {
        booking: {
          select: {
            id: true,
            guest: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
