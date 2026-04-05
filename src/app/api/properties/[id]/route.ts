import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  requireAuth,
  requireRole,
  isUser,
  hasPropertyAccess,
  verifyPropertyOwnership,
  notFound,
  forbidden,
  badRequest,
} from "@/lib/authorization";
import { updatePropertySchema, validateBody } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        rooms: true,
      },
    });

    if (!property) {
      return notFound("Property");
    }

    // Public access is allowed for listed properties
    if (property.isListed) {
      return NextResponse.json(property);
    }

    // Non-listed properties require auth and property-level access
    const authResult = requireAuth(request);
    if (!isUser(authResult)) return authResult;
    const user = authResult;

    const accessible = await hasPropertyAccess(user, id);
    if (!accessible) {
      return forbidden("You do not have access to this property");
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json({ error: "Failed to fetch property" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    // Only ADMIN and OWNER may update properties
    const authResult = requireRole(request, "ADMIN", "OWNER");
    if (!isUser(authResult)) return authResult;
    const user = authResult;

    const { id } = await context.params;

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      return notFound("Property");
    }

    // ADMIN must be assigned to the property; OWNER must own it
    const accessible = await hasPropertyAccess(user, id);
    if (!accessible) {
      return forbidden("You do not have access to this property");
    }

    const body = await request.json();
    const validation = validateBody(updatePropertySchema, body);
    if (validation.error) {
      return badRequest(validation.error);
    }
    const data = validation.data!;

    const property = await prisma.property.update({
      where: { id },
      data,
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // Only OWNER may delete properties
    const authResult = requireRole(request, "OWNER");
    if (!isUser(authResult)) return authResult;
    const user = authResult;

    const { id } = await context.params;

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      return notFound("Property");
    }

    // Owner must own this specific property
    const isOwner = await verifyPropertyOwnership(user.id, id);
    if (!isOwner) {
      return forbidden("You do not own this property");
    }

    // Soft delete
    const property = await prisma.property.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Property deleted", id: property.id });
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 });
  }
}
