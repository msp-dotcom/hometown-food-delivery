import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/hotels/:id/menu — all menu items for one hotel
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const items = await prisma.menuItem.findMany({
    where: { hotelId: params.id },
    orderBy: { category: "asc" },
  });
  return NextResponse.json(items);
}

// POST /api/hotels/:id/menu — add a new menu item (used by Admin > Menu Items)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { name, price, category, imageEmoji } = body;

  if (!name || !price || !category) {
    return NextResponse.json(
      { error: "name, price, and category are required" },
      { status: 400 }
    );
  }

  const item = await prisma.menuItem.create({
    data: {
      hotelId: params.id,
      name,
      price: Number(price),
      category,
      imageEmoji: imageEmoji || "🍽",
    },
  });
  return NextResponse.json(item, { status: 201 });
}
