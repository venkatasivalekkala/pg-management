import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (user.role !== "ADMIN" && user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only admins and owners can list users" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role") as Role | null;
    const propertyId = searchParams.get("propertyId");

    const where: Record<string, unknown> = {};
    if (role) where.role = role;

    // If filtering by propertyId, find users associated with that property
    if (propertyId) {
      const propertyUsers = await prisma.user.findMany({
        where: {
          ...where,
          OR: [
            // Staff/admins assigned to the property
            { adminProperties: { some: { propertyId, isActive: true } } },
            // Guests with bookings at the property
            { bookings: { some: { room: { propertyId } } } },
            // Owners of the property
            { ownedProperties: { some: { id: propertyId } } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatarUrl: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ data: propertyUsers });
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error("Error listing users:", error);
    return NextResponse.json(
      { error: "Failed to list users" },
      { status: 500 }
    );
  }
}
