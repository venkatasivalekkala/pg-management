import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { MealType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const propertyId = searchParams.get("propertyId");
    const date = searchParams.get("date");
    const mealType = searchParams.get("mealType") as MealType | null;

    const where: Record<string, unknown> = {};
    if (propertyId) where.propertyId = propertyId;
    if (mealType) where.mealType = mealType;
    if (date) {
      const dateObj = new Date(date);
      const nextDay = new Date(dateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = { gte: dateObj, lt: nextDay };
    }

    const [data, total] = await Promise.all([
      prisma.meal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          property: { select: { id: true, name: true } },
          _count: { select: { optIns: true } },
        },
      }),
      prisma.meal.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error listing meals:", error);
    return NextResponse.json(
      { error: "Failed to list meals" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, date, mealType, menuItems, expectedCount } = body;

    if (!propertyId || !date || !mealType || !menuItems) {
      return NextResponse.json(
        { error: "Missing required fields: propertyId, date, mealType, menuItems" },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const meal = await prisma.meal.create({
      data: {
        propertyId,
        date: new Date(date),
        mealType,
        menuItems,
        expectedCount: expectedCount || 0,
      },
      include: {
        property: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(meal, { status: 201 });
  } catch (error) {
    console.error("Error creating meal:", error);
    return NextResponse.json(
      { error: "Failed to create meal" },
      { status: 500 }
    );
  }
}
