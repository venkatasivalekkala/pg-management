import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { GenderType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const city = searchParams.get("city");
    const genderType = searchParams.get("genderType") as GenderType | null;
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { isActive: true };

    if (city) where.city = city;
    if (genderType) where.genderType = genderType;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }
    if (minPrice || maxPrice) {
      where.rooms = {
        some: {
          monthlyRent: {
            ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
            ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
          },
        },
      };
    }

    const [data, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { owner: { select: { id: true, name: true, email: true } } },
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error listing properties:", error);
    return NextResponse.json(
      { error: "Failed to list properties" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Missing x-user-id header" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only users with OWNER role can create properties" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, address, city, state, pincode, latitude, longitude, genderType, amenities, rules, photos } = body;

    if (!name || !address || !city || !state || !pincode || !genderType) {
      return NextResponse.json(
        { error: "Missing required fields: name, address, city, state, pincode, genderType" },
        { status: 400 }
      );
    }

    const property = await prisma.property.create({
      data: {
        ownerId: userId,
        name,
        description,
        address,
        city,
        state,
        pincode,
        latitude,
        longitude,
        genderType,
        amenities,
        rules,
        photos,
      },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}
