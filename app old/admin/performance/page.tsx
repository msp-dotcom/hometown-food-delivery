import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HotelPerformancePage() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const hotels = await prisma.hotel.findMany();

  const rows = await Promise.all(
    hotels.map(async (h) => {
      const [orderCount7d, lastOrder] = await Promise.all([
        prisma.orderItem.count({
          where: { hotelId: h.id, order: { createdAt: { gte: sevenDaysAgo } } },
        }),
        prisma.orderItem.findFirst({
          where: { hotelId: h.id },
          orderBy: { order: { createdAt: "desc" } },
          include: { order: true },
        }),
      ]);
      const lastOrderDate = lastOrder?.order.createdAt;
      const isInactive = !lastOrderDate || lastOrderDate < twoDaysAgo;
      return { hotel: h, orderCount7d, lastOrderDate, isInactive };
    })
  );

  return (
    <div>
      <p className="text-[10px] font-bold tracking-wide text-[#B87A1F] uppercase mb-1">Operations</p>
      <h1 className="text-2xl font-extrabold mb-1">Hotel Performance</h1>
      <p className="text-xs text-[#68706B] mb-6">
        Order activity per hotel — no automatic messages sent to them.
      </p>

      <div className="bg-white border border-[#E4DFD1] rounded-xl p-5">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[10px] uppercase text-[#68706B] border-b border-[#E4DFD1]">
              <th className="py-2">Hotel</th>
              <th>Orders (7 days)</th>
              <th>Last order</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.hotel.id} className="border-b border-[#E4DFD1] last:border-0">
                <td className="py-2 font-bold">{row.hotel.name}</td>
                <td className="font-mono">{row.orderCount7d}</td>
                <td className="font-mono">
                  {row.lastOrderDate ? new Date(row.lastOrderDate).toLocaleDateString() : "—"}
                </td>
                <td>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      row.isInactive ? "bg-[#B4483A]/10 text-[#B4483A]" : "bg-[#2E7D6B]/10 text-[#2E7D6B]"
                    }`}
                  >
                    {row.isInactive ? "Inactive 2+ days" : "Active"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
