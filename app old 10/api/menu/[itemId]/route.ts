import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// PATCH /api/menu/:itemId — edit name/price/category (the Edit button from Admin)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  const body = await req.json();
  const item = await prisma.menuItem.update({
    where: { id: params.itemId },
    data: {
      name: body.name,
      price: body.price !== undefined ? Number(body.price) : undefined,
      category: body.category,
      available: body.available,
    },
  });
  return NextResponse.json(item);
}

// DELETE /api/menu/:itemId — remove an item
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  await prisma.menuItem.delete({ where: { id: params.itemId } });
  return NextResponse.json({ ok: true });
}
