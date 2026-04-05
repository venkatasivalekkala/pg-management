import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { VisitorStatus } from "@prisma/client";
import {
  requireAuth,
  isUser,
  getUserPropertyIds,
  hasPropertyAccess,
  forbidden,
  notFound,
  badRequest,
} from "@/lib/authorization";
import { createVisitorSchema, validateBody } from "@/lib/validations";

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
    const status = searchParams.get("status") as VisitorStatus | null;

    const where: Record<string, unknown> = {};

    if (user.role === "GUEST") {
      // GUESTs can only see their own visitor registrations
      where.guestId = user.id;
    } else {
      // ADMIN, OWNER, STAFF: scope to accessible properties
      const accessiblePropertyIds = await getUserPropertyIds(user);

      if (propertyId) {
        if (!accessiblePropertyIds.includes(propertyId)) {
          return forbidden("You do not have access to the requested property");
        }
        where.propertyId = propertyId;
      } else {
        where.propertyId = { in: accessiblePropertyIds };
      }
    }

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
    return NextResponse.json({ error: "Failed to list visitors" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = requireAuth(request);
  if (!isUser(authResult)) return authResult;
  const user = authResult;

  // OWNER cannot register visitors
  if (user.role === "OWNER") {
    return forbidden("Owners cannot register visitors");
  }

  try {
    const body = await request.json();
    const validation = validateBody(createVisitorSchema, body);
    if (validation.error) return badRequest(validation.error);
    const { propertyId, visitorName, visitorPhone, visitorIdProof, purpose, entryTime } =
      validation.data!;

    // Determine guestId: GUESTs always register under their own id
    let guestId: string;
    if (user.role === "GUEST") {
      guestId = user.id;
    } else {
      // ADMIN / STAFF: accept guestId from body, fall back to the acting user
      guestId = body.guestId ?? user.id;
    }

    // Verify the caller has access to the target property
    const hasAccess = await hasPropertyAccess(user, propertyId);
    if (!hasAccess) return forbidden("You do not have access to this property");

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return notFound("Property");

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
    return NextResponse.json({ error: "Failed to register visitor" }, { status: 500 });
  }
}
