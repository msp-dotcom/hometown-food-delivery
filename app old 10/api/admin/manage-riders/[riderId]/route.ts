import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// DELETE /api/admin/manage-riders/:riderId
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { riderId: string } }
) {
  // Unassign this rider from any orders first, so deleting doesn't break order history
  await prisma.order.updateMany({
    where: { riderId: params.riderId },
    data: { riderId: null },
  });
  await prisma.rider.delete({ where: { id: params.riderId } });
  return NextResponse.json({ ok: true });
}
