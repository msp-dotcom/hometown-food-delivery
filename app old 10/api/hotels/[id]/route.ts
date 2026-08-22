import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/hotels/:id — hotel details + its menu items
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const hotel = await prisma.hotel.findUnique({
    where: { id: params.id },
    include: { menuItems: true },
  });
  if (!hotel) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(hotel);
}

// PATCH /api/hotels/:id — toggle Open/Closed status, or update coordinates
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const data: any = {};
  if (typeof body.isOpen === "boolean") data.isOpen = body.isOpen;
  if (typeof body.latitude === "number") data.latitude = body.latitude;
  if (typeof body.longitude === "number") data.longitude = body.longitude;

  const hotel = await prisma.hotel.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json(hotel);
}

// DELETE /api/hotels/:id — remove a hotel (and its menu items)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Menu items reference the hotel, so delete them first
  await prisma.menuItem.deleteMany({ where: { hotelId: params.id } });
  await prisma.hotel.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
