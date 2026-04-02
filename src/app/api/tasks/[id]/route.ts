import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;

    const task = await prisma.staffTask.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, email: true, phone: true } },
        assigner: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, name: true } },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;

    const existing = await prisma.staffTask.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const body = await request.json();
    const { status, priority, description, completedAt, assignedTo, dueDate, title } = body;

    // Staff can only update status; admin/owner can update everything
    const isAdminOrOwner = user.role === "ADMIN" || user.role === "OWNER";
    const isAssignee = existing.assignedTo === user.id;

    if (!isAdminOrOwner && !isAssignee) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};

    // Staff can update status
    if (status !== undefined) {
      updateData.status = status;
      if (status === "COMPLETED" && !existing.completedAt) {
        updateData.completedAt = new Date();
      }
    }

    // Only admin/owner can update these fields
    if (isAdminOrOwner) {
      if (priority !== undefined) updateData.priority = priority;
      if (description !== undefined) updateData.description = description;
      if (completedAt !== undefined) updateData.completedAt = completedAt ? new Date(completedAt) : null;
      if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
      if (title !== undefined) updateData.title = title;
    }

    const task = await prisma.staffTask.update({
      where: { id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true } },
        assigner: { select: { id: true, name: true } },
        property: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
