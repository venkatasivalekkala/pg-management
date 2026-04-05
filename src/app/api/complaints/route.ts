import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ComplaintStatus, ComplaintPriority, ComplaintCategory } from "@prisma/client";
import {
  requireAuth,
  isUser,
  getUserPropertyIds,
  hasPropertyAccess,
  forbidden,
  badRequest,
} from "@/lib/authorization";
import { createComplaintSchema, validateBody } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const result = requireAuth(request);
    if (!isUser(result)) return result;
    const user = result;

    // ── Query params ─────────────────────────────────────────────────────────
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const propertyId = searchParams.get("propertyId");
    const status = searchParams.get("status") as ComplaintStatus | null;
    const priority = searchParams.get("priority") as ComplaintPriority | null;
    const category = searchParams.get("category") as ComplaintCategory | null;

    // ── Base filter from query params ────────────────────────────────────────
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;

    // ── Role-based scoping ───────────────────────────────────────────────────
    if (user.role === "GUEST") {
      // Guests only see their own complaints; ignore any propertyId filter
      where.guestId = user.id;
    } else if (user.role === "STAFF") {
      // Staff only see complaints assigned to them
      where.assignedTo = user.id;
    } else {
      // ADMIN and OWNER: restrict to their properties
      const accessiblePropertyIds = await getUserPropertyIds(user);

      if (propertyId) {
        // Honour the requested propertyId only if the user has access to it
        if (!accessiblePropertyIds.includes(propertyId)) {
          return forbidden("You do not have access to this property");
        }
        where.propertyId = propertyId;
      } else {
        where.propertyId = { in: accessiblePropertyIds };
      }
    }

    // ── Query ─────────────────────────────────────────────────────────────────
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
    return NextResponse.json({ error: "Failed to list complaints" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const result = requireAuth(request);
    if (!isUser(result)) return result;
    const user = result;

    // Only GUEST and ADMIN can create complaints
    if (user.role === "OWNER" || user.role === "STAFF") {
      return forbidden("Only guests and admins can create complaints");
    }

    // ── Validate body ────────────────────────────────────────────────────────
    const body = await request.json();
    const validation = validateBody(createComplaintSchema, body);
    if (validation.error) return badRequest(validation.error);
    const { propertyId, roomId, category, title, description, photos, priority } = validation.data!;

    // ── Role-based checks ────────────────────────────────────────────────────
    let guestId: string;

    if (user.role === "GUEST") {
      // Force guestId to authenticated user; verify they have access to the property
      guestId = user.id;
      const canAccess = await hasPropertyAccess(user, propertyId);
      if (!canAccess) {
        return forbidden("You do not have access to this property");
      }
    } else {
      // ADMIN: verify property is in their assigned list
      const canAccess = await hasPropertyAccess(user, propertyId);
      if (!canAccess) {
        return forbidden("You do not have access to this property");
      }
      // Admin must supply guestId in the body (not part of createComplaintSchema,
      // so we read it directly from the raw body)
      if (!body.guestId) {
        return badRequest("guestId is required");
      }
      guestId = body.guestId as string;
    }

    // ── Create ────────────────────────────────────────────────────────────────
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
    return NextResponse.json({ error: "Failed to create complaint" }, { status: 500 });
  }
}
