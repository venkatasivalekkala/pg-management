import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ComplaintStatus, ComplaintPriority, ComplaintCategory } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const propertyId = searchParams.get("propertyId");
    const status = searchParams.get("status") as ComplaintStatus | null;
    const priority = searchParams.get("priority") as ComplaintPriority | null;
    const category = searchParams.get("category") as ComplaintCategory | null;

    const where: Record<string, unknown> = {};
    if (propertyId) where.propertyId = propertyId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;

    const [data, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          guest: { select: { id: true, name: true, email: true } },
          property: { select: { id: true, name: true } },
          room: { select: { id: true, roomNumber: true } },
          assignee: { select: { id: true, name: true } },
        },
      }),
      prisma.complaint.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error listing complaints:", error);
    return NextResponse.json(
      { error: "Failed to list complaints" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestId, propertyId, roomId, category, title, description, photos, priority } = body;

    if (!guestId || !propertyId || !category || !title || !description) {
      return NextResponse.json(
        { error: "Missing required fields: guestId, propertyId, category, title, description" },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.create({
      data: {
        guestId,
        propertyId,
        roomId,
        category,
        title,
        description,
        photos,
        priority: priority || "MEDIUM",
      },
      include: {
        guest: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    console.error("Error creating complaint:", error);
    return NextResponse.json(
      { error: "Failed to create complaint" },
      { status: 500 }
    );
  }
}
