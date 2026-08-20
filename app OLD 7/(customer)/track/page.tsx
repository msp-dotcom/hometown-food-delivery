"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const STEPS = ["PLACED", "ACCEPTED", "PREPARING", "READY", "PICKED_UP", "DELIVERED"];
const LABELS: Record<string, string> = {
  PLACED: "Order Placed",
  ACCEPTED: "Hotel Accepted",
  PREPARING: "Preparing",
  READY: "Food Ready",
  PICKED_UP: "Picked Up",
  DELIVERED: "Delivered",
};

export default function TrackPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-charcoalSoft">Loading…</p>}>
      <TrackContent />
    </Suspense>
  );
}

function TrackContent() {
  const params = useSearchParams();
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);

  // Prefer the phone in the URL (fresh from checkout); otherwise fall back to
  // the last phone number used, remembered locally — so tapping "Track" from
  // the bottom nav still works, not just the redirect right after ordering.
  useEffect(() => {
    const fromUrl = params.get("phone");
    if (fromUrl) {
      setPhone(fromUrl);
      localStorage.setItem("lastOrderPhone", fromUrl);
    } else {
      setPhone(localStorage.getItem("lastOrderPhone") || "");
    }
    setCheckedStorage(true);
  }, [params]);

  useEffect(() => {
    if (!phone) return;
    fetch(`/api/orders?phone=${encodeURIComponent(phone)}`)
      .then((r) => r.json())
      .then((orders) => setOrder(orders[0] || null));
  }, [phone]);

  if (!checkedStorage) return <p className="p-6 text-sm text-charcoalSoft">Loading…</p>;
  if (!phone) return <p className="p-6 text-sm text-charcoalSoft">No order to track yet.</p>;
  if (!order) return <p className="p-6 text-sm text-charcoalSoft">Loading order…</p>;

  const currentIndex = STEPS.indexOf(order.status);
  const hotelNames = Array.from(new Set(order.items.map((i: any) => i.hotel.name)));

  return (
    <div className="px-4 pt-8">
      <div className="text-center mb-6">
        <p className="text-xs text-charcoalSoft">
          ORDER <b>#{order.id.slice(-6).toUpperCase()}</b> · {hotelNames.join(" + ")}
        </p>
        <h1 className="text-lg font-bold mt-1">
          {order.deliveredAt ? "Delivered" : LABELS[order.status]}
        </h1>
      </div>

      <div className="space-y-4">
        {STEPS.map((step, idx) => (
          <div key={step} className="flex gap-3 items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                idx < currentIndex
                  ? "bg-green text-white"
                  : idx === currentIndex
                  ? "bg-mustard text-white"
                  : "bg-sand text-charcoalSoft border border-line"
              }`}
            >
              {idx < currentIndex ? "✓" : idx + 1}
            </div>
            <span className="text-sm font-semibold">{LABELS[step]}</span>
          </div>
        ))}
      </div>

      <div className="bg-sand rounded-xl p-3 mt-6 flex justify-between items-center">
        <div className="text-xs text-charcoalSoft">
          Need to change or cancel?
          <br />
          Call support — no self-cancel
        </div>
        <button className="bg-green text-white text-xs font-bold px-3 py-2 rounded-lg">📞 Call</button>
      </div>
    </div>
  );
}
