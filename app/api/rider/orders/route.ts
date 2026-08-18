import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/rider/orders?riderId=xxx — the rider's current active order, if any
export async function GET(req: NextRequest) {
  const riderId = req.nextUrl.searchParams.get("riderId");
  if (!riderId) return NextResponse.json({ error: "riderId is required" }, { status: 400 });

  const order = await prisma.order.findFirst({
    where: { riderId, status: { notIn: ["DELIVERED"] } },
    include: { items: { include: { hotel: true, menuItem: true } }, customer: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(order || null);
}
