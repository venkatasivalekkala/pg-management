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

    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        recorder: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, name: true } },
      },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Error fetching expense:", error);
    return NextResponse.json(
      { error: "Failed to fetch expense" },
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

    if (user.role !== "ADMIN" && user.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    const body = await request.json();
    const { category, amount, description, date } = body;

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...(category !== undefined && { category }),
        ...(amount !== undefined && { amount }),
        ...(description !== undefined && { description }),
        ...(date !== undefined && { date: new Date(date) }),
      },
      include: {
        recorder: { select: { id: true, name: true } },
        property: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (user.role !== "ADMIN" && user.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // Hard delete
    await prisma.expense.delete({ where: { id } });

    return NextResponse.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}
