import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { TaskStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const propertyId = searchParams.get("propertyId");
    const assignedTo = searchParams.get("assignedTo");
    const status = searchParams.get("status") as TaskStatus | null;

    const where: Record<string, unknown> = {};
    if (propertyId) where.propertyId = propertyId;
    if (assignedTo) where.assignedTo = assignedTo;
    if (status) where.status = status;

    const tasks = await prisma.staffTask.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        assignee: { select: { id: true, name: true } },
        assigner: { select: { id: true, name: true } },
        property: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: tasks });
  } catch (error) {
    console.error("Error listing tasks:", error);
    return NextResponse.json(
      { error: "Failed to list tasks" },
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
        { error: "Only admins and owners can create tasks" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { propertyId, assignedTo, title, description, priority, dueDate } = body;

    if (!propertyId || !assignedTo || !title) {
      return NextResponse.json(
        { error: "Missing required fields: propertyId, assignedTo, title" },
        { status: 400 }
      );
    }

    const task = await prisma.staffTask.create({
      data: {
        propertyId,
        assignedTo,
        assignedBy: user.id,
        title,
        description,
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true } },
        assigner: { select: { id: true, name: true } },
        property: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
