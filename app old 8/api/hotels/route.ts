import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/hotels — list all hotels (used by Home page)
export async function GET() {
  const hotels = await prisma.hotel.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(hotels);
}

// POST /api/hotels — create a new hotel (used by Admin > Add Hotel)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, address, latitude, longitude } = body;

  if (!name || !phone || !address) {
    return NextResponse.json(
      { error: "name, phone, and address are required" },
      { status: 400 }
    );
  }

  const hotel = await prisma.hotel.create({
    data: { name, phone, address, latitude, longitude },
  });
  return NextResponse.json(hotel, { status: 201 });
}
