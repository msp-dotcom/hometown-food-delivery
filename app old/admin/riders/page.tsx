"use client";

import { useEffect, useState } from "react";

export default function RiderEarningsPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/admin/riders?date=${date}`)
      .then((r) => r.json())
      .then(setData);
  }, [date]);

  return (
    <div>
      <div className="flex justify-between items-end mb-6 print:hidden">
        <div>
          <p className="text-[10px] font-bold tracking-wide text-[#B87A1F] uppercase mb-1">Operations</p>
          <h1 className="text-2xl font-extrabold mb-1">Rider Earnings</h1>
          <p className="text-xs text-[#68706B]">Rider gets 80% of the delivery charge per order.</p>
        </div>
        <div className="flex gap-2 items-end">
          <div>
            <label className="text-[10px] font-bold text-[#68706B] block mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-[#E4DFD1] rounded-lg px-3 py-2 text-xs"
            />
          </div>
          <button
            onClick={() => window.print()}
            className="border border-[#E4DFD1] rounded-lg px-3 py-2 text-xs font-bold"
          >
            🖨 Print
          </button>
        </div>
      </div>

      {!data ? (
        <p className="text-xs text-[#68706B]">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white border border-[#E4DFD1] rounded-xl p-4">
              <div className="font-mono text-xl font-bold text-[#2E7D6B]">{data.totalDeliveries}</div>
              <div className="text-[11px] text-[#68706B] mt-1">Deliveries on {data.date}</div>
            </div>
            <div className="bg-white border border-[#E4DFD1] rounded-xl p-4">
              <div className="font-mono text-xl font-bold text-[#B87A1F]">₹{data.totalRiderPayout}</div>
              <div className="text-[11px] text-[#68706B] mt-1">Total rider payout</div>
            </div>
            <div className="bg-white border border-[#E4DFD1] rounded-xl p-4">
              <div className="font-mono text-xl font-bold">₹{data.totalPlatformShare}</div>
              <div className="text-[11px] text-[#68706B] mt-1">Platform's 20%</div>
            </div>
          </div>

          {data.riders.length === 0 ? (
            <p className="text-xs text-[#68706B]">No deliveries on this date.</p>
          ) : (
            data.riders.map((r: any) => (
              <div key={r.riderId} className="bg-white border border-[#E4DFD1] rounded-xl p-5 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-extrabold">{r.name}</p>
                  <p className="font-mono text-sm font-bold">₹{r.riderEarnings} total</p>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-[10px] uppercase text-[#68706B] border-b border-[#E4DFD1]">
                      <th className="py-2">Order</th>
                      <th>Hotel(s)</th>
                      <th>Delivery charge</th>
                      <th>Rider earns (80%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.orders.map((o: any) => (
                      <tr key={o.id} className="border-b border-[#E4DFD1] last:border-0">
                        <td className="py-2 font-mono">{o.id.slice(-6).toUpperCase()}</td>
                        <td>{o.hotelNames}</td>
                        <td className="font-mono">₹{o.deliveryFee}</td>
                        <td className="font-mono">₹{o.riderEarning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}
