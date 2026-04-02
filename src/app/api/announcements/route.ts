import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const propertyId = searchParams.get("propertyId");

    const where: Record<string, unknown> = { isActive: true };
    if (propertyId) where.propertyId = propertyId;

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      include: {
        author: { select: { id: true, name: true } },
        property: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: announcements });
  } catch (error) {
    console.error("Error listing announcements:", error);
    return NextResponse.json(
      { error: "Failed to list announcements" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (user.role !== "ADMIN" && user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only admins and owners can create announcements" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { propertyId, title, content, type, isPinned } = body;

    if (!propertyId || !title || !content) {
      return NextResponse.json(
        { error: "Missing required fields: propertyId, title, content" },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        propertyId,
        authorId: user.id,
        title,
        content,
        type: type || "GENERAL",
        isPinned: isPinned || false,
      },
      include: {
        author: { select: { id: true, name: true } },
        property: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}
