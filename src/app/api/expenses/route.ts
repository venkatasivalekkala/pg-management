import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { ExpenseCategory } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const propertyId = searchParams.get("propertyId");
    const category = searchParams.get("category") as ExpenseCategory | null;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Record<string, unknown> = {};
    if (propertyId) where.propertyId = propertyId;
    if (category) where.category = category;
    if (from || to) {
      where.date = {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      };
    }

    const [data, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          recorder: { select: { id: true, name: true } },
          property: { select: { id: true, name: true } },
        },
      }),
      prisma.expense.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error listing expenses:", error);
    return NextResponse.json(
      { error: "Failed to list expenses" },
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
        { error: "Only admins and owners can create expenses" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { propertyId, category, amount, description, date } = body;

    if (!propertyId || !category || !amount || !date) {
      return NextResponse.json(
        { error: "Missing required fields: propertyId, category, amount, date" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        propertyId,
        category,
        amount,
        description,
        date: new Date(date),
        recordedBy: user.id,
      },
      include: {
        recorder: { select: { id: true, name: true } },
        property: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
