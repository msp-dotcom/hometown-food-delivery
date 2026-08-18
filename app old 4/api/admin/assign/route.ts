import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/assign  { orderId, riderId }
export async function PATCH(req: NextRequest) {
  const { orderId, riderId } = await req.json();
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { riderId, status: "ACCEPTED" },
  });
  // Rider becomes busy the instant they're assigned — matches the auto-busy rule
  await prisma.rider.update({ where: { id: riderId }, data: { available: false } });
  return NextResponse.json(order);
}
