import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const where: Record<string, unknown> = { userId: user.id };
    if (unreadOnly) where.isRead = false;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: notifications });
  } catch (error) {
    console.error("Error listing notifications:", error);
    return NextResponse.json(
      { error: "Failed to list notifications" },
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
        { error: "Only admins and owners can create notifications" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, title, message, type } = body;

    if (!userId || !title || !message || !type) {
      return NextResponse.json(
        { error: "Missing required fields: userId, title, message, type" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
