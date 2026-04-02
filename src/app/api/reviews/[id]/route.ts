import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        guest: { select: { id: true, name: true } },
        property: { select: { id: true, name: true } },
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "Failed to fetch review" },
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

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Only own review or admin
    if (existing.guestId !== user.id && user.role !== "ADMIN" && user.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { rating, comment } = body;

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const review = await prisma.review.update({
      where: { id },
      data: {
        ...(rating !== undefined && { rating }),
        ...(comment !== undefined && { comment }),
      },
      include: {
        guest: { select: { id: true, name: true } },
      },
    });

    // Recalculate avgRating if rating changed
    if (rating !== undefined) {
      const avgResult = await prisma.review.aggregate({
        where: { propertyId: existing.propertyId, isPublic: true },
        _avg: { rating: true },
      });

      await prisma.property.update({
        where: { id: existing.propertyId },
        data: { avgRating: avgResult._avg.rating ?? 0 },
      });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Soft delete: set isPublic to false
    await prisma.review.update({
      where: { id },
      data: { isPublic: false },
    });

    return NextResponse.json({ message: "Review hidden successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
