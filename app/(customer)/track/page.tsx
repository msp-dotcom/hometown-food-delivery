"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { mapsLink } from "@/lib/distance";

const STEPS = ["PLACED", "ACCEPTED", "PREPARING", "READY", "PICKED_UP", "DELIVERED"];
const LABELS: Record<string, string> = { PLACED: "Order Placed", ACCEPTED: "Hotel Accepted", PREPARING: "Preparing Food", READY: "Food Ready", PICKED_UP: "Out for Delivery", DELIVERED: "Delivered" };

export default function TrackPage() { return <Suspense fallback={<div className="px-5 py-16 text-center text-sm text-charcoalSoft">Loading…</div>}><TrackContent /></Suspense>; }

function TrackContent() {
  const params = useSearchParams();
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => { const fromUrl = params.get("phone"); if (fromUrl) { setPhone(fromUrl); localStorage.setItem("lastOrderPhone", fromUrl); } else setPhone(localStorage.getItem("lastOrderPhone") || ""); setCheckedStorage(true); }, [params]);
  useEffect(() => { if (!phone) return; fetch(`/api/orders?phone=${encodeURIComponent(phone)}`).then((r) => r.json()).then((orders) => setOrder(orders[0] || null)); }, [phone]);

  async function shareLocation() {
    if (!navigator.geolocation) { alert("Location isn't available in this browser"); return; }
    setSharing(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      await fetch(`/api/orders/${order.id}/location`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lat: latitude, lng: longitude }) });
      const link = mapsLink(latitude, longitude); const text = `My exact location for the delivery: ${link}`;
      if (navigator.share) { try { await navigator.share({ text }); } catch {} } else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
      setSharing(false); setOrder((prev: any) => ({ ...prev, customerLat: latitude, customerLng: longitude }));
    }, () => { alert("Couldn't get your location"); setSharing(false); }, { timeout: 10000 });
  }

  if (!checkedStorage) return <div className="px-5 py-16 text-center text-sm text-charcoalSoft">Loading…</div>;
  if (!phone) return <div className="px-5 py-20 text-center"><div className="mb-4 text-5xl">🛵</div><p className="text-sm font-bold text-charcoal">No order to track yet.</p></div>;
  if (!order) return <div className="px-5 py-20 text-center text-sm text-charcoalSoft">Loading order…</div>;

  const currentIndex = STEPS.indexOf(order.status);
  const hotelNames = Array.from(new Set(order.items.map((i: any) => i.hotel.name)));
  const mapUrl = useMemo(() => {
    if (!order.customerLat || !order.customerLng) return "";
    const lat = Number(order.customerLat); const lng = Number(order.customerLng); const d = 0.008;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng-d}%2C${lat-d}%2C${lng+d}%2C${lat+d}&layer=mapnik&marker=${lat}%2C${lng}`;
  }, [order.customerLat, order.customerLng]);

  return (
    <div className="px-4 pt-6 pb-8 sm:px-5">
      <div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-mustard">Live order</p><h1 className="mt-1 text-2xl font-black tracking-tight text-charcoal">Order Tracking</h1></div><span className="rounded-full bg-green/10 px-3 py-1.5 text-[10px] font-black text-green">● {order.deliveredAt ? "Completed" : "Live"}</span></div>

      <div className="mb-4 rounded-[22px] bg-charcoal p-4 text-white shadow-lift"><div className="flex items-center justify-between"><span className="text-xs font-bold text-white/60">ORDER</span><span className="text-xs font-black">#{order.id.slice(-6).toUpperCase()}</span></div><p className="mt-2 text-lg font-black">{order.deliveredAt ? "Delivered" : LABELS[order.status]}</p><p className="mt-1 text-xs text-white/65">{hotelNames.join(" + ")}</p></div>

      <div className="rounded-[22px] border border-line bg-white p-4 shadow-soft">
        <p className="mb-4 text-sm font-black text-charcoal">Delivery progress</p>
        <div className="space-y-1">
          {STEPS.map((step, idx) => <div key={step} className="relative flex gap-3 py-2.5">
            {idx < STEPS.length - 1 && <span className="absolute left-[15px] top-9 h-[calc(100%-2px)] w-px bg-line" />}
            <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${idx < currentIndex ? "bg-green text-white" : idx === currentIndex ? "bg-chili text-white shadow-sm" : "bg-sand text-charcoalSoft border border-line"}`}>{idx < currentIndex ? "✓" : idx === currentIndex && step === "PICKED_UP" ? "🛵" : idx + 1}</div>
            <div><p className={`text-sm font-black ${idx <= currentIndex ? "text-charcoal" : "text-charcoalSoft"}`}>{LABELS[step]}</p>{idx === currentIndex && <p className="mt-0.5 text-[11px] text-charcoalSoft">{step === "PICKED_UP" ? "Rider is on the way" : "Your order is being processed"}</p>}</div>
          </div>)}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[22px] border border-line bg-white shadow-soft">
        <div className="flex items-center justify-between p-4"><div><p className="text-sm font-black">Delivery map</p><p className="mt-1 text-[11px] text-charcoalSoft">No Google Maps API required</p></div><span className="text-2xl">🗺️</span></div>
        {mapUrl ? <iframe title="Delivery location map" src={mapUrl} className="h-52 w-full border-0" loading="lazy" /> : <div className="flex h-52 items-center justify-center bg-gradient-to-br from-orange-50 via-sand to-white px-8 text-center"><div><div className="mb-2 text-4xl">📍</div><p className="text-sm font-black text-charcoal">Delivery location not shared yet</p><p className="mt-1 text-[11px] leading-5 text-charcoalSoft">Share your exact GPS location when the rider needs help finding your entrance.</p></div></div>}
        {order.customerLat && order.customerLng && <div className="flex items-center justify-between border-t border-line px-4 py-3 text-[11px]"><span className="font-bold text-charcoalSoft">GPS location shared</span><span className="font-black text-green">● Active</span></div>}
      </div>

      {order.status !== "DELIVERED" && order.status !== "CANCELLED" && <button onClick={shareLocation} disabled={sharing} className="mt-4 w-full rounded-2xl bg-chili py-4 text-sm font-black text-white shadow-lift disabled:opacity-60 active:scale-[.99]">{sharing ? "Getting your location…" : order.customerLat ? "📍 Share Location Again" : "📍 Share My Exact Location"}</button>}

      <div className="mt-4 flex items-center justify-between gap-3 rounded-[20px] bg-sand p-4"><div><p className="text-sm font-black text-charcoal">Need help?</p><p className="mt-1 text-[11px] leading-5 text-charcoalSoft">Call support to change or cancel your order.</p></div><a href={`tel:${process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+919845000000"}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green text-xl text-white shadow-sm">📞</a></div>
    </div>
  );
}
