import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            guest: { select: { id: true, name: true, email: true, phone: true } },
            room: {
              include: {
                property: { select: { id: true, name: true, city: true } },
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment" },
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

    const existing = await prisma.payment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, gatewayTxnId, invoiceUrl, paidAt } = body;

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(gatewayTxnId !== undefined && { gatewayTxnId }),
        ...(invoiceUrl !== undefined && { invoiceUrl }),
        ...(paidAt !== undefined && { paidAt: new Date(paidAt) }),
        ...(status === "SUCCESS" && !paidAt ? { paidAt: new Date() } : {}),
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
}
