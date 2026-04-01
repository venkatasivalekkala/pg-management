import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        guest: { select: { id: true, name: true, email: true, phone: true } },
        property: { select: { id: true, name: true, city: true, address: true } },
        room: { select: { id: true, roomNumber: true, floor: true } },
        assignee: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(complaint);
  } catch (error) {
    console.error("Error fetching complaint:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaint" },
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

    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, priority, assignedTo, satisfactionRating } = body;

    const complaint = await prisma.complaint.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(satisfactionRating !== undefined && { satisfactionRating }),
        ...(status === "RESOLVED" && !existing.resolvedAt ? { resolvedAt: new Date() } : {}),
      },
      include: {
        guest: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(complaint);
  } catch (error) {
    console.error("Error updating complaint:", error);
    return NextResponse.json(
      { error: "Failed to update complaint" },
      { status: 500 }
    );
  }
}
