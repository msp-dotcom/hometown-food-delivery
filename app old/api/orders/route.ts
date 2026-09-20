import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeRouteDistance, computeDeliveryFee } from "@/lib/distance";

export const dynamic = "force-dynamic";

// POST /api/orders — place an order
// Body: { phone, deliveryAddress, paymentMethod, items: [{menuItemId, qty}], customerLat?, customerLng? }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { phone, deliveryAddress, paymentMethod, items, customerLat, customerLng } = body;

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

  // Look up each menu item to get its live price and hotel (with coordinates for the fee calc)
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: items.map((i: any) => i.menuItemId) } },
    include: { hotel: true },
  });

  const hotelsInOrder = Array.from(
    new Map(menuItems.map((m) => [m.hotel.id, m.hotel])).values()
  );

  // Multi-hotel rule: only 1 or 2 hotels allowed per order (matches the distance-limited
  // multi-hotel cart rule — the distance check itself should happen on the frontend
  // before reaching checkout, using each hotel's lat/lng).
  if (hotelsInOrder.length > 2) {
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

  // Distance-based delivery fee: ₹20 flat for the first km, +₹15/km after —
  // calculated server-side (never trust a client-sent price) using each hotel's
  // real coordinates and the customer's location, routed hotel -> hotel -> customer.
  let deliveryFee = 30; // fallback flat fee if we don't have a customer location yet
  if (customerLat && customerLng) {
    const stops = [
      ...hotelsInOrder
        .filter((h) => h.latitude != null && h.longitude != null)
        .map((h) => ({ lat: h.latitude as number, lng: h.longitude as number })),
      { lat: customerLat, lng: customerLng },
    ];
    if (stops.length >= 2) {
      const distanceKm = computeRouteDistance(stops);
      deliveryFee = computeDeliveryFee(distanceKm);
    }
  }

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
  // buttons to each hotel in hotelsInOrder, using their `phone` field.

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
