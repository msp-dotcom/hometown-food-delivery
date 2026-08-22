"use client";

import { useEffect, useState } from "react";

type Hotel = { id: string; name: string };

export default function SettlementsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelId, setHotelId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/hotels")
      .then((r) => r.json())
      .then((list) => {
        setHotels(list);
        if (list.length > 0) setHotelId(list[0].id);
      });
  }, []);

  useEffect(() => {
    if (!hotelId) return;
    fetch(`/api/admin/settlements?hotelId=${hotelId}&date=${date}`)
      .then((r) => r.json())
      .then(setData);
  }, [hotelId, date]);

  const hotelName = hotels.find((h) => h.id === hotelId)?.name || "";

  return (
    <div>
      <div className="flex justify-between items-end mb-6 print:hidden">
        <div>
          <p className="text-[10px] font-bold tracking-wide text-[#B87A1F] uppercase mb-1">Operations</p>
          <h1 className="text-2xl font-extrabold mb-1">Hotel Settlements</h1>
          <p className="text-xs text-[#68706B]">Filter by hotel and date, then print for handoff.</p>
        </div>
        <div className="flex gap-2 items-end">
          <div>
            <label className="text-[10px] font-bold text-[#68706B] block mb-1">Hotel</label>
            <select
              value={hotelId}
              onChange={(e) => setHotelId(e.target.value)}
              className="border border-[#E4DFD1] rounded-lg px-3 py-2 text-xs"
            >
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#68706B] block mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-[#E4DFD1] rounded-lg px-3 py-2 text-xs"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E4DFD1] rounded-xl p-5">
        <div className="flex justify-between items-center mb-3 print:hidden">
          <p className="text-sm font-extrabold">
            {hotelName} <span className="text-[10px] text-[#68706B] font-normal">{data?.orders.length ?? 0} orders on {date}</span>
          </p>
          <button
            onClick={() => window.print()}
            className="border border-[#E4DFD1] rounded-lg px-3 py-2 text-xs font-bold"
          >
            🖨 Print
          </button>
        </div>

        {!data || data.orders.length === 0 ? (
          <p className="text-xs text-[#68706B]">No orders for this hotel on this date.</p>
        ) : (
          <>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] uppercase text-[#68706B] border-b border-[#E4DFD1]">
                  <th className="py-2">Order</th>
                  <th>Items</th>
                  <th>Price</th>
                  <th>Order time</th>
                  <th>Delivered time</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((o: any) => (
                  <tr key={o.orderId} className="border-b border-[#E4DFD1] last:border-0">
                    <td className="py-2 font-mono">{o.orderId.slice(-6).toUpperCase()}</td>
                    <td>{o.items.join(", ")}</td>
                    <td className="font-mono">₹{o.total}</td>
                    <td className="font-mono">{new Date(o.orderTime).toLocaleTimeString()}</td>
                    <td className="font-mono">
                      {o.deliveredTime ? new Date(o.deliveredTime).toLocaleTimeString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between mt-4 pt-4 border-t border-dashed border-[#E4DFD1]">
              <span className="text-xs font-extrabold">Total — {date}</span>
              <span className="font-mono text-xs font-extrabold">₹{data.total}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
