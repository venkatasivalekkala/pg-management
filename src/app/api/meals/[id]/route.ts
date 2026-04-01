import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const meal = await prisma.meal.findUnique({
      where: { id },
      include: {
        property: { select: { id: true, name: true } },
        optIns: {
          include: {
            guest: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!meal) {
      return NextResponse.json(
        { error: "Meal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(meal);
  } catch (error) {
    console.error("Error fetching meal:", error);
    return NextResponse.json(
      { error: "Failed to fetch meal" },
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

    const existing = await prisma.meal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Meal not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { menuItems, expectedCount, actualCount, feedbackAvgRating } = body;

    const meal = await prisma.meal.update({
      where: { id },
      data: {
        ...(menuItems !== undefined && { menuItems }),
        ...(expectedCount !== undefined && { expectedCount }),
        ...(actualCount !== undefined && { actualCount }),
        ...(feedbackAvgRating !== undefined && { feedbackAvgRating }),
      },
      include: {
        property: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(meal);
  } catch (error) {
    console.error("Error updating meal:", error);
    return NextResponse.json(
      { error: "Failed to update meal" },
      { status: 500 }
    );
  }
}
