import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;

    const noticePeriod = await prisma.noticePeriod.findUnique({
      where: { id },
      include: {
        guest: { select: { id: true, name: true, email: true, phone: true } },
        booking: {
          select: {
            id: true,
            checkInDate: true,
            checkOutDate: true,
            status: true,
            room: { select: { id: true, roomNumber: true, floor: true } },
          },
        },
      },
    });

    if (!noticePeriod) {
      return NextResponse.json({ error: "Notice period not found" }, { status: 404 });
    }

    return NextResponse.json(noticePeriod);
  } catch (error) {
    console.error("Error fetching notice period:", error);
    return NextResponse.json(
      { error: "Failed to fetch notice period" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;

    const existing = await prisma.noticePeriod.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Notice period not found" }, { status: 404 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Missing required field: status" },
        { status: 400 }
      );
    }

    // Validate status transitions
    const isAdminOrOwner = user.role === "ADMIN" || user.role === "OWNER";
    const isGuest = existing.guestId === user.id;

    if (status === "APPROVED" || status === "COMPLETED") {
      if (!isAdminOrOwner) {
        return NextResponse.json(
          { error: "Only admins and owners can approve or complete notice periods" },
          { status: 403 }
        );
      }
    } else if (status === "WITHDRAWN") {
      if (!isGuest) {
        return NextResponse.json(
          { error: "Only the guest can withdraw a notice period" },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Invalid status. Allowed: APPROVED, COMPLETED, WITHDRAWN" },
        { status: 400 }
      );
    }

    const noticePeriod = await prisma.noticePeriod.update({
      where: { id },
      data: { status },
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

    return NextResponse.json(noticePeriod);
  } catch (error) {
    console.error("Error updating notice period:", error);
    return NextResponse.json(
      { error: "Failed to update notice period" },
      { status: 500 }
    );
  }
}
