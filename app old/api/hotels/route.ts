import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/hotels — list all hotels (used by Home page)
// GET /api/hotels?ids=id1,id2 — fetch just specific hotels (used by Cart for distance calc)
export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get("ids");
  if (idsParam) {
    const ids = idsParam.split(",").filter(Boolean);
    const hotels = await prisma.hotel.findMany({ where: { id: { in: ids } } });
    return NextResponse.json(hotels);
  }
  const hotels = await prisma.hotel.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(hotels);
}

// POST /api/hotels — create a new hotel (used by Admin > Add Hotel)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, address, latitude, longitude, imageUrl } = body;

  if (!name || !phone || !address) {
    return NextResponse.json(
      { error: "name, phone, and address are required" },
      { status: 400 }
    );
  }

  const hotel = await prisma.hotel.create({
    data: { name, phone, address, latitude, longitude, imageUrl },
  });
  return NextResponse.json(hotel, { status: 201 });
}
