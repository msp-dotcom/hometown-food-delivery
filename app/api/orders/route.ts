import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/orders — place an order
// Body: { phone, deliveryAddress, paymentMethod, items: [{menuItemId, qty}] }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { phone, deliveryAddress, paymentMethod, items } = body;

  if (!phone || !deliveryAddress || !items?.length) {
    return NextResponse.json(
      { error: "phone, deliveryAddress, and at least one item are required" },
      { status: 400 }
    );
  }

  // Find or create the customer by phone (no separate signup — matches our "no login friction" decision)
  const customer = await prisma.customer.upsert({
    where: { phone },
    update: {},
    create: { phone },
  });

  // Look up each menu item to get its live price and hotel
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: items.map((i: any) => i.menuItemId) } },
  });

  const hotelIds = Array.from(new Set(menuItems.map((m) => m.hotelId)));

  // Multi-hotel rule: only 1 or 2 hotels allowed per order (matches the distance-limited
  // multi-hotel cart rule — the distance check itself should happen on the frontend
  // before reaching checkout, using each hotel's lat/lng).
  if (hotelIds.length > 2) {
    return NextResponse.json(
      { error: "Orders can combine at most 2 hotels at a time" },
      { status: 400 }
    );
  }

  const subtotal = items.reduce((sum: number, i: any) => {
    const menuItem = menuItems.find((m) => m.id === i.menuItemId);
    return sum + (menuItem?.price ?? 0) * i.qty;
  }, 0);
  const gst = Math.round(subtotal * 0.05);
  const deliveryFee = hotelIds.length > 1 ? 35 : 30; // combined fee for multi-hotel trips
  const total = subtotal + gst + deliveryFee;

  const order = await prisma.order.create({
    data: {
      customerId: customer.id,
      status: "PLACED",
      paymentMethod: paymentMethod || "COD",
      deliveryAddress,
      subtotal,
      gst,
      deliveryFee,
      total,
      items: {
        create: items.map((i: any) => {
          const menuItem = menuItems.find((m) => m.id === i.menuItemId)!;
          return {
            hotelId: menuItem.hotelId,
            menuItemId: menuItem.id,
            quantity: i.qty,
            priceEach: menuItem.price,
          };
        }),
      },
    },
    include: { items: true },
  });

  // NOTE: This is where the WhatsApp send-to-hotel call goes once a BSP
  // (AiSensy/Interakt) is connected — send order details + Accept/Reject
  // buttons to each hotel in hotelIds, using their `phone` field.

  return NextResponse.json(order, { status: 201 });
}

// GET /api/orders?phone=... — used by the Track page
export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");
  if (!phone) return NextResponse.json({ error: "phone is required" }, { status: 400 });

  const customer = await prisma.customer.findUnique({ where: { phone } });
  if (!customer) return NextResponse.json([]);

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    include: { items: { include: { menuItem: true, hotel: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  return NextResponse.json(orders);
}
