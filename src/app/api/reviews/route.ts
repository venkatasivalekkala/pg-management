import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);

    const searchParams = request.nextUrl.searchParams;
    const propertyId = searchParams.get("propertyId");

    const where: Record<string, unknown> = {};
    if (propertyId) where.propertyId = propertyId;

    // Only show public reviews unless the requester is an admin/owner
    if (!user || (user.role !== "ADMIN" && user.role !== "OWNER")) {
      where.isPublic = true;
    }

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        guest: { select: { id: true, name: true } },
        property: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: reviews });
  } catch (error) {
    console.error("Error listing reviews:", error);
    return NextResponse.json(
      { error: "Failed to list reviews" },
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
        { error: "Only guests can create reviews" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { propertyId, rating, comment } = body;

    if (!propertyId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields: propertyId, rating" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        guestId: user.id,
        propertyId,
        rating,
        comment,
      },
      include: {
        guest: { select: { id: true, name: true } },
        property: { select: { id: true, name: true } },
      },
    });

    // Update property avgRating
    const avgResult = await prisma.review.aggregate({
      where: { propertyId, isPublic: true },
      _avg: { rating: true },
    });

    await prisma.property.update({
      where: { id: propertyId },
      data: { avgRating: avgResult._avg.rating ?? 0 },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
