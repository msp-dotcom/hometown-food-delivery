import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/admin/riders?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const dateParam = req.nextUrl.searchParams.get("date");
  const day = dateParam ? new Date(dateParam) : new Date();
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      riderId: { not: null },
    },
    include: { rider: true, items: { include: { hotel: true } } },
  });

  const byRider: Record<string, any> = {};
  for (const o of orders) {
    if (!o.rider) continue;
    const riderEarning = Math.round(o.deliveryFee * 0.8);
    if (!byRider[o.rider.id]) {
      byRider[o.rider.id] = {
        riderId: o.rider.id,
        name: o.rider.name,
        deliveries: 0,
        deliveryChargesCollected: 0,
        riderEarnings: 0,
        available: o.rider.available,
        orders: [],
      };
    }
    byRider[o.rider.id].deliveries += 1;
    byRider[o.rider.id].deliveryChargesCollected += o.deliveryFee;
    byRider[o.rider.id].riderEarnings += riderEarning;
    byRider[o.rider.id].orders.push({
      id: o.id,
      hotelNames: Array.from(new Set(o.items.map((i) => i.hotel.name))).join(" + "),
      deliveryFee: o.deliveryFee,
      riderEarning,
      status: o.status,
    });
  }

  const totalDeliveries = orders.length;
  const totalRiderPayout = Object.values(byRider).reduce((s: number, r: any) => s + r.riderEarnings, 0);
  const totalPlatformShare = Object.values(byRider).reduce(
    (s: number, r: any) => s + (r.deliveryChargesCollected - r.riderEarnings),
    0
  );

  return NextResponse.json({
    date: start.toISOString().slice(0, 10),
    totalDeliveries,
    totalRiderPayout,
    totalPlatformShare,
    riders: Object.values(byRider),
  });
}
