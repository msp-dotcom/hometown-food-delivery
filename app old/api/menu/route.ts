import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/menu?category=Non-Veg — items in this category from every open hotel
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  if (!category) return NextResponse.json({ error: "category is required" }, { status: 400 });

  const items = await prisma.menuItem.findMany({
    where: { category, available: true, hotel: { isOpen: true } },
    include: { hotel: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(items);
}
