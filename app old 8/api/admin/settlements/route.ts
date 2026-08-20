import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/admin/settlements?hotelId=xxx&date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const hotelId = req.nextUrl.searchParams.get("hotelId");
  const dateParam = req.nextUrl.searchParams.get("date");
  if (!hotelId) return NextResponse.json({ error: "hotelId is required" }, { status: 400 });

  const day = dateParam ? new Date(dateParam) : new Date();
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);

  const items = await prisma.orderItem.findMany({
    where: {
      hotelId,
      order: { createdAt: { gte: start, lte: end } },
    },
    include: { order: true, menuItem: true },
  });

  // Group by order so multi-item orders show as one row with combined item text
  const byOrder: Record<string, any> = {};
  for (const item of items) {
    if (!byOrder[item.orderId]) {
      byOrder[item.orderId] = {
        orderId: item.orderId,
        items: [],
        total: 0,
        orderTime: item.order.createdAt,
        deliveredTime: item.order.deliveredAt,
      };
    }
    byOrder[item.orderId].items.push(`${item.menuItem.name} × ${item.quantity}`);
    byOrder[item.orderId].total += item.priceEach * item.quantity;
  }

  const orders = Object.values(byOrder);
  const total = orders.reduce((s: number, o: any) => s + o.total, 0);

  return NextResponse.json({ date: start.toISOString().slice(0, 10), orders, total });
}
