import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// PATCH /api/admin/orders/:orderId  { status?, deliveryFee? }
// status lets Admin manually move an order through its stages until WhatsApp
// automation is connected — also used for the Cancel action.
// deliveryFee lets Admin correct the fee on a specific order (e.g. when a
// rider reports the real road route was much longer than our straight-line
// estimate) — the total is recalculated automatically.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const body = await req.json();
  const { status, deliveryFee } = body;

  const existing = await prisma.order.findUnique({ where: { id: params.orderId } });
  if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const data: any = {};
  if (status) {
    data.status = status;
    data.deliveredAt = status === "DELIVERED" ? new Date() : undefined;
  }
  if (typeof deliveryFee === "number") {
    data.deliveryFee = deliveryFee;
    data.total = existing.subtotal + existing.gst + deliveryFee;
  }

  const order = await prisma.order.update({
    where: { id: params.orderId },
    data,
  });

  // Free up the rider if the order gets cancelled after being assigned
  if (status === "CANCELLED" && order.riderId) {
    await prisma.rider.update({ where: { id: order.riderId }, data: { available: true } });
  }

  return NextResponse.json(order);
}
