import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const visitor = await prisma.visitor.findUnique({
      where: { id },
      include: {
        guest: { select: { id: true, name: true, email: true, phone: true } },
        property: { select: { id: true, name: true, city: true, address: true } },
        approver: { select: { id: true, name: true } },
      },
    });

    if (!visitor) {
      return NextResponse.json(
        { error: "Visitor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(visitor);
  } catch (error) {
    console.error("Error fetching visitor:", error);
    return NextResponse.json(
      { error: "Failed to fetch visitor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const existing = await prisma.visitor.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Visitor not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, approvedBy, entryTime, exitTime } = body;

    const updateData: Record<string, unknown> = {};

    if (status !== undefined) {
      updateData.status = status;

      if (status === "CHECKED_IN" && !existing.entryTime && !entryTime) {
        updateData.entryTime = new Date();
      }
      if (status === "CHECKED_OUT" && !existing.exitTime && !exitTime) {
        updateData.exitTime = new Date();
      }
    }

    if (approvedBy !== undefined) updateData.approvedBy = approvedBy;
    if (entryTime !== undefined) updateData.entryTime = new Date(entryTime);
    if (exitTime !== undefined) updateData.exitTime = new Date(exitTime);

    const visitor = await prisma.visitor.update({
      where: { id },
      data: updateData,
      include: {
        guest: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(visitor);
  } catch (error) {
    console.error("Error updating visitor:", error);
    return NextResponse.json(
      { error: "Failed to update visitor" },
      { status: 500 }
    );
  }
}
