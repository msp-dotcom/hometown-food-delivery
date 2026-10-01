"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { mapsLink } from "@/lib/distance";

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
  const [sharing, setSharing] = useState(false);

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

  async function shareLocation() {
    if (!navigator.geolocation) {
      alert("Location isn't available in this browser");
      return;
    }
    setSharing(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Save this precise location to the order so the rider can see it too
        await fetch(`/api/orders/${order.id}/location`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: latitude, lng: longitude }),
        });
        const link = mapsLink(latitude, longitude);
        const text = `My exact location for the delivery: ${link}`;

        // Use the phone's native Share sheet if available (same experience as WhatsApp's
        // own location button) — falls back to opening WhatsApp directly with the link.
        if (navigator.share) {
          try {
            await navigator.share({ text });
          } catch {
            // person cancelled the share sheet — no error needed
          }
        } else {
          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
        }
        setSharing(false);
        setOrder((prev: any) => ({ ...prev, customerLat: latitude, customerLng: longitude }));
      },
      () => {
        alert("Couldn't get your location");
        setSharing(false);
      },
      { timeout: 10000 }
    );
  }

  if (!checkedStorage) return <p className="p-6 text-sm text-charcoalSoft">Loading…</p>;
  if (!phone) return <p className="p-6 text-sm text-charcoalSoft">No order to track yet.</p>;
  if (!order) return <p className="p-6 text-sm text-charcoalSoft">Loading order…</p>;

  const currentIndex = STEPS.indexOf(order.status);
  const hotelNames = Array.from(new Set(order.items.map((i: any) => i.hotel.name)));

  return (
    <div className="customer-page px-5 pt-6 pb-8">
      <div className="mb-7 rounded-2xl bg-sand p-5 text-center">
        <p className="text-xs text-charcoalSoft leading-relaxed">
          ORDER <b>#{order.id.slice(-6).toUpperCase()}</b> · {hotelNames.join(" + ")}
        </p>
        <h1 className="mt-2 text-[22px] font-extrabold tracking-[-0.03em]">
          {order.deliveredAt ? "Delivered" : LABELS[order.status]}
        </h1>
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_3px_14px_rgba(23,33,43,0.05)] space-y-5">
        {STEPS.map((step, idx) => (
          <div key={step} className="flex gap-3.5 items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
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

      {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
        <button
          onClick={shareLocation}
          disabled={sharing}
          className="w-full min-h-12 bg-mustard text-white text-sm font-bold rounded-xl py-3.5 mt-6 shadow-sm disabled:opacity-60"
        >
          {sharing ? "Getting your location…" : order.customerLat ? "📍 Share Location Again" : "📍 Share My Exact Location"}
        </button>
      )}
      <p className="text-[11px] text-charcoalSoft text-center mt-2 leading-relaxed">
        Helps the rider find you precisely — especially useful in apartments, PGs, or gated entrances.
      </p>

      <div className="bg-sand rounded-2xl p-4 mt-6 flex justify-between items-center gap-3">
        <div className="text-xs text-charcoalSoft leading-relaxed">
          Need to change or cancel?
          <br />
          Call support — no self-cancel
        </div>
        <a
          href={`tel:${process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+919845000000"}`}
          className="min-h-10 bg-green text-white text-xs font-bold px-4 py-2.5 rounded-xl flex-shrink-0"
        >
          📞 Call
        </a>
      </div>
    </div>
  );
}
