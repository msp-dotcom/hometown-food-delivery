import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LiveDeliveryPage() {
  const activeOrders = await prisma.order.findMany({
    where: { status: { not: "DELIVERED" } },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { hotel: true } }, rider: true, customer: true },
  });

  const riders = await prisma.rider.findMany();

  return (
    <div>
      <p className="text-[10px] font-bold tracking-wide text-[#B87A1F] uppercase mb-1">Operations</p>
      <h1 className="text-2xl font-extrabold mb-1">Live Delivery</h1>
      <p className="text-xs text-[#68706B] mb-6">Every active order — hotel timing, rider, and progress.</p>

      <div className="bg-white border border-[#E4DFD1] rounded-xl p-5 mb-5">
        {activeOrders.length === 0 ? (
          <p className="text-xs text-[#68706B]">No active orders right now.</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] uppercase text-[#68706B] border-b border-[#E4DFD1]">
                <th className="py-2">Order</th>
                <th>Hotel(s)</th>
                <th>Placed</th>
                <th>Rider</th>
                <th>Customer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeOrders.map((o) => {
                const hotelNames = Array.from(new Set(o.items.map((i) => i.hotel.name)));
                return (
                  <tr key={o.id} className="border-b border-[#E4DFD1] last:border-0">
                    <td className="py-2 font-mono">{o.id.slice(-6).toUpperCase()}</td>
                    <td>{hotelNames.join(" + ")}</td>
                    <td className="font-mono">{new Date(o.createdAt).toLocaleTimeString()}</td>
                    <td>
                      {o.rider?.name || (
                        <span className="text-[#B4483A] font-bold">Unassigned</span>
                      )}
                    </td>
                    <td className="font-mono">{o.customer.phone}</td>
                    <td>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#DE9A34]/10 text-[#B87A1F]">
                        {o.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white border border-[#E4DFD1] rounded-xl p-5">
        <p className="text-sm font-extrabold mb-3">Riders on duty</p>
        {riders.length === 0 ? (
          <p className="text-xs text-[#68706B]">No riders added yet.</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] uppercase text-[#68706B] border-b border-[#E4DFD1]">
                <th className="py-2">Rider</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {riders.map((r) => (
                <tr key={r.id} className="border-b border-[#E4DFD1] last:border-0">
                  <td className="py-2 font-bold">{r.name}</td>
                  <td className="font-mono">{r.phone}</td>
                  <td>
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        r.available ? "bg-[#2E7D6B]/10 text-[#2E7D6B]" : "bg-[#B4483A]/10 text-[#B4483A]"
                      }`}
                    >
                      {r.available ? "Available" : "Busy/Offline"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
