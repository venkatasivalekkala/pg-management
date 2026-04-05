import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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
import { updateMealSchema, validateBody } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const authResult = requireAuth(request);
  if (!isUser(authResult)) return authResult;
  const user = authResult;

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

    if (!meal) return notFound("Meal");

    // Verify the meal's property is within the user's accessible properties
    const accessiblePropertyIds = await getUserPropertyIds(user);
    if (!accessiblePropertyIds.includes(meal.propertyId)) {
      return forbidden("You do not have access to this meal");
    }

    return NextResponse.json(meal);
  } catch (error) {
    console.error("Error fetching meal:", error);
    return NextResponse.json({ error: "Failed to fetch meal" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  // ADMIN, OWNER, and STAFF may update meals
  const authResult = requireRole(request, "ADMIN", "OWNER", "STAFF");
  if (!isUser(authResult)) return authResult;
  const user = authResult;

  try {
    const { id } = await context.params;

    const existing = await prisma.meal.findUnique({ where: { id } });
    if (!existing) return notFound("Meal");

    // Verify the user has access to the property this meal belongs to
    const hasAccess = await hasPropertyAccess(user, existing.propertyId);
    if (!hasAccess) return forbidden("You do not have access to this meal");

    const body = await request.json();
    const validation = validateBody(updateMealSchema, body);
    if (validation.error) return badRequest(validation.error);
    const { menuItems, expectedCount, actualCount } = validation.data!;

    const meal = await prisma.meal.update({
      where: { id },
      data: {
        ...(menuItems !== undefined && { menuItems }),
        ...(expectedCount !== undefined && { expectedCount }),
        ...(actualCount !== undefined && { actualCount }),
      },
      include: {
        property: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(meal);
  } catch (error) {
    console.error("Error updating meal:", error);
    return NextResponse.json({ error: "Failed to update meal" }, { status: 500 });
  }
}
