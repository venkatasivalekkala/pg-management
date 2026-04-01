import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PaymentStatus, PaymentType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const bookingId = searchParams.get("bookingId");
    const status = searchParams.get("status") as PaymentStatus | null;
    const type = searchParams.get("type") as PaymentType | null;
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

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
              room: { select: { id: true, roomNumber: true, property: { select: { id: true, name: true } } } },
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
    return NextResponse.json(
      { error: "Failed to list payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, amount, currency, type, method, dueDate, gatewayTxnId, invoiceUrl } = body;

    if (!bookingId || !amount || !type || !method || !dueDate) {
      return NextResponse.json(
        { error: "Missing required fields: bookingId, amount, type, method, dueDate" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount,
        currency: currency || "INR",
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
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
