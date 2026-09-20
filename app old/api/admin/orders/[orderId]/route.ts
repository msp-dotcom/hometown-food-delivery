import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// PATCH /api/admin/orders/:orderId  { status }
// Lets Admin manually move an order through its stages until WhatsApp automation
// is connected — also used for the Cancel action.
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

  // Free up the rider if the order gets cancelled after being assigned
  if (status === "CANCELLED" && order.riderId) {
    await prisma.rider.update({ where: { id: order.riderId }, data: { available: true } });
  }

  return NextResponse.json(order);
}
