import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { VisitorStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const propertyId = searchParams.get("propertyId");
    const date = searchParams.get("date");
    const status = searchParams.get("status") as VisitorStatus | null;

    const where: Record<string, unknown> = {};
    if (propertyId) where.propertyId = propertyId;
    if (status) where.status = status;
    if (date) {
      const dateObj = new Date(date);
      const nextDay = new Date(dateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      where.createdAt = { gte: dateObj, lt: nextDay };
    }

    const [data, total] = await Promise.all([
      prisma.visitor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          guest: { select: { id: true, name: true, email: true } },
          property: { select: { id: true, name: true } },
          approver: { select: { id: true, name: true } },
        },
      }),
      prisma.visitor.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error listing visitors:", error);
    return NextResponse.json(
      { error: "Failed to list visitors" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestId, propertyId, visitorName, visitorPhone, visitorIdProof, purpose, entryTime } = body;

    if (!guestId || !propertyId || !visitorName || !visitorPhone || !purpose) {
      return NextResponse.json(
        { error: "Missing required fields: guestId, propertyId, visitorName, visitorPhone, purpose" },
        { status: 400 }
      );
    }

    const visitor = await prisma.visitor.create({
      data: {
        guestId,
        propertyId,
        visitorName,
        visitorPhone,
        visitorIdProof,
        purpose,
        entryTime: entryTime ? new Date(entryTime) : null,
      },
      include: {
        guest: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(visitor, { status: 201 });
  } catch (error) {
    console.error("Error registering visitor:", error);
    return NextResponse.json(
      { error: "Failed to register visitor" },
      { status: 500 }
    );
  }
}
