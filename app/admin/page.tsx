import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [ordersToday, hotelsOpenCount, hotels, recentOrders] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.hotel.count({ where: { isOpen: true } }),
    prisma.hotel.findMany(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: { include: { hotel: true } }, rider: true },
    }),
  ]);

  const revenueToday = await prisma.order.aggregate({
    where: { createdAt: { gte: startOfToday } },
    _sum: { deliveryFee: true },
  });
  const platformShareToday = Math.round((revenueToday._sum.deliveryFee || 0) * 0.2);

  return (
    <div>
      <p className="text-[10px] font-bold tracking-wide text-[#B87A1F] uppercase mb-1">Today</p>
      <h1 className="text-2xl font-extrabold mb-1">Dashboard</h1>
      <p className="text-xs text-[#68706B] mb-6">Live snapshot of hotels, orders, and deliveries.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Orders today" value={ordersToday} color="text-[#B87A1F]" />
        <StatCard label="Hotels open now" value={hotelsOpenCount} color="text-[#2E7D6B]" />
        <StatCard label="Total hotels" value={hotels.length} />
        <StatCard label="Platform's 20% today" value={`₹${platformShareToday}`} color="text-[#B87A1F]" />
      </div>

      <div className="bg-white border border-[#E4DFD1] rounded-xl p-5">
        <p className="text-sm font-extrabold mb-3">Recent Orders</p>
        {recentOrders.length === 0 ? (
          <p className="text-xs text-[#68706B]">No orders yet.</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] uppercase text-[#68706B] border-b border-[#E4DFD1]">
                <th className="py-2">Order</th>
                <th>Hotel(s)</th>
                <th>Status</th>
                <th>Rider</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => {
                const hotelNames = Array.from(new Set(o.items.map((i) => i.hotel.name)));
                return (
                  <tr key={o.id} className="border-b border-[#E4DFD1] last:border-0">
                    <td className="py-2 font-mono">{o.id.slice(-6).toUpperCase()}</td>
                    <td>{hotelNames.join(" + ")}</td>
                    <td>{o.status}</td>
                    <td>{o.rider?.name || "Unassigned"}</td>
                    <td className="font-mono">₹{o.total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-white border border-[#E4DFD1] rounded-xl p-4">
      <div className={`font-mono text-xl font-bold ${color || ""}`}>{value}</div>
      <div className="text-[11px] text-[#68706B] mt-1">{label}</div>
    </div>
  );
}
