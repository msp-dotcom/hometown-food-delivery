import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// PATCH /api/orders/:orderId/location  { lat, lng }
// Used by the customer's "Share My Exact Location" button on the Track page —
// updates the order with a more precise pin (e.g. dropped right at their
// actual PG/apartment entrance) after the order was already placed.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { lat, lng } = await req.json();
  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id: params.orderId },
    data: { customerLat: lat, customerLng: lng },
  });

  return NextResponse.json(order);
}
