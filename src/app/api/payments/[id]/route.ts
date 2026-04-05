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
import { updatePaymentSchema, validateBody } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────
    const authResult = requireAuth(request);
    if (!isUser(authResult)) return authResult;
    const user = authResult;

    // STAFF have no access to payments
    if (user.role === "STAFF") {
      return forbidden("Staff are not permitted to view payments");
    }

    const { id } = await context.params;

    // ── Fetch payment ─────────────────────────────────────────────────────
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
      return notFound("Payment");
    }

    // ── Access check ──────────────────────────────────────────────────────
    if (user.role === "GUEST") {
      // GUESTs can only view payments for their own bookings
      if (payment.booking.guest.id !== user.id) {
        return notFound("Payment");
      }
    } else {
      // ADMIN / OWNER: payment must belong to one of their properties
      const propertyIds = await getUserPropertyIds(user);
      if (!propertyIds.includes(payment.booking.room.property.id)) {
        return notFound("Payment");
      }
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json({ error: "Failed to fetch payment" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────
    const authResult = requireAuth(request);
    if (!isUser(authResult)) return authResult;
    const user = authResult;

    // Only ADMIN / OWNER can update payments
    if (user.role !== "ADMIN" && user.role !== "OWNER") {
      return forbidden("Only admins and owners can update payments");
    }

    const { id } = await context.params;

    // ── Fetch existing payment ────────────────────────────────────────────
    const existing = await prisma.payment.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        booking: {
          select: {
            room: { select: { propertyId: true } },
          },
        },
      },
    });

    if (!existing) {
      return notFound("Payment");
    }

    // ── Property access check ─────────────────────────────────────────────
    const propertyIds = await getUserPropertyIds(user);
    if (!propertyIds.includes(existing.booking.room.propertyId)) {
      return forbidden("You do not manage the property for this payment");
    }

    // ── Validate body ─────────────────────────────────────────────────────
    const body = await request.json();
    const validation = validateBody(updatePaymentSchema, body);
    if (validation.error) {
      return badRequest(validation.error);
    }
    const { status, gatewayTxnId, paidAt, method } = validation.data!;

    // ── Update ────────────────────────────────────────────────────────────
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(gatewayTxnId !== undefined && { gatewayTxnId }),
        ...(method !== undefined && { method }),
        ...(paidAt !== undefined && { paidAt: new Date(paidAt) }),
        // Auto-set paidAt when marking SUCCESS if not explicitly provided
        ...(status === "SUCCESS" && !paidAt ? { paidAt: new Date() } : {}),
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }
}
