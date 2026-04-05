import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { MealType } from "@prisma/client";
import {
  requireAuth,
  requireRole,
  isUser,
  getUserPropertyIds,
  hasPropertyAccess,
  forbidden,
  notFound,
  badRequest,
} from "@/lib/authorization";
import { createMealSchema, validateBody } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request);
  if (!isUser(authResult)) return authResult;
  const user = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const propertyId = searchParams.get("propertyId");
    const date = searchParams.get("date");
    const mealType = searchParams.get("mealType") as MealType | null;

    // Resolve the set of property IDs this user can see
    const accessiblePropertyIds = await getUserPropertyIds(user);

    // If the caller filtered by a specific propertyId, verify access first
    if (propertyId && !accessiblePropertyIds.includes(propertyId)) {
      return forbidden("You do not have access to the requested property");
    }

    const where: Record<string, unknown> = {};

    // Scope to accessible properties; narrow further if the caller specified one
    where.propertyId = propertyId ? propertyId : { in: accessiblePropertyIds };

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
    return NextResponse.json({ error: "Failed to list meals" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Only ADMIN and OWNER may create meals
  const authResult = requireRole(request, "ADMIN", "OWNER");
  if (!isUser(authResult)) return authResult;
  const user = authResult;

  try {
    const body = await request.json();
    const validation = validateBody(createMealSchema, body);
    if (validation.error) return badRequest(validation.error);
    const { propertyId, date, mealType, menuItems, expectedCount } = validation.data!;

    // Verify the user has access to this property
    const hasAccess = await hasPropertyAccess(user, propertyId);
    if (!hasAccess) return forbidden("You do not have access to this property");

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return notFound("Property");

    const meal = await prisma.meal.create({
      data: {
        propertyId,
        date: new Date(date),
        mealType,
        menuItems,
        expectedCount: expectedCount ?? 0,
      },
      include: {
        property: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(meal, { status: 201 });
  } catch (error) {
    console.error("Error creating meal:", error);
    return NextResponse.json({ error: "Failed to create meal" }, { status: 500 });
  }
}
