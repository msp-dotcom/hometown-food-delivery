import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// PATCH /api/rider/orders/:orderId  { status }
// Auto-busy rule: when an order reaches DELIVERED, the rider is freed up automatically.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { status } = await req.json();

  const order = await prisma.order.update({
    where: { id: params.orderId },
    data: {
      status,
      deliveredAt: status === "DELIVERED" ? new Date() : undefined,
    },
  });

  if (status === "DELIVERED" && order.riderId) {
    await prisma.rider.update({
      where: { id: order.riderId },
      data: { available: true },
    });
  }

  return NextResponse.json(order);
}
