import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/categories — every distinct category currently used by an
// available item at an open hotel, used for Home page's category chips.
export async function GET() {
  const items = await prisma.menuItem.findMany({
    where: { available: true, hotel: { isOpen: true } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return NextResponse.json(items.map((i) => i.category));
}
