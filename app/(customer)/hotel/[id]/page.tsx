"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { haversineKm } from "@/lib/distance";

type MenuItem = { id: string; name: string; price: number; category: string; imageEmoji: string; imageUrl?: string | null; available: boolean };
type Hotel = { id: string; name: string; address: string; imageUrl?: string | null; latitude: number | null; longitude: number | null; menuItems: MenuItem[] };
const MAX_COMBINE_KM = 2;

export default function HotelPage({ params }: { params: { id: string } }) {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [filter, setFilter] = useState("all");
  const { items, addItem, changeQty, totals } = useCart();
  const router = useRouter();

  useEffect(() => { fetch(`/api/hotels/${params.id}`).then((r) => r.json()).then(setHotel); }, [params.id]);
  if (!hotel) return <div className="px-5 py-16 text-center text-sm text-charcoalSoft">Loading menu…</div>;

  const categories = Array.from(new Set(hotel.menuItems.map((m) => m.category))).sort();
  const filtered = (cat: string) => hotel.menuItems.filter((m) => m.category === cat && (filter === "all" || filter === cat));

  async function handleAdd(m: MenuItem) {
    const otherHotelId = items.find((i) => i.hotelId !== hotel!.id)?.hotelId;
    if (otherHotelId) {
      const res = await fetch(`/api/hotels?ids=${otherHotelId},${hotel!.id}`);
      const both = await res.json(); const a = both.find((h: any) => h.id === otherHotelId); const b = both.find((h: any) => h.id === hotel!.id);
      if (!a?.latitude || !b?.latitude) { alert("Can't combine with your current cart yet — one of the hotels doesn't have a location set. Place this as a separate order instead."); return; }
      const distanceKm = haversineKm(a.latitude, a.longitude, b.latitude, b.longitude);
      if (distanceKm > MAX_COMBINE_KM) { alert(`This hotel is ${distanceKm.toFixed(1)} km from your other cart items — too far to combine into one delivery. Please place it as a separate order.`); return; }
    }
    addItem({ menuItemId: m.id, hotelId: hotel!.id, hotelName: hotel!.name, name: m.name, price: m.price });
  }

  return (
    <div className="pb-28">
      <div className="relative h-48 overflow-hidden bg-orange-100">
        {hotel.imageUrl ? <img src={hotel.imageUrl} className="h-full w-full object-cover" alt={hotel.name} /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-200 to-orange-50 text-7xl">🍽️</div>}
        <button onClick={() => router.back()} className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/95 text-xl shadow-lg">←</button>
        <div className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/95 text-xl shadow-lg">♡</div>
      </div>

      <div className="relative -mt-6 rounded-t-[28px] bg-white px-4 pt-6 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div><h1 className="text-[27px] font-black tracking-tight text-charcoal">{hotel.name}</h1><p className="mt-1 max-w-[330px] text-xs leading-5 text-charcoalSoft">{hotel.address}</p></div>
          <span className="rounded-2xl bg-orange-50 px-3 py-2 text-2xl shadow-sm">🍛</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold"><span className="rounded-full bg-green/10 px-2.5 py-1 text-green">● Open</span><span className="text-amber-500">★</span><span className="text-charcoalSoft">Local favourite</span><span className="text-charcoalSoft">•</span><span className="text-charcoalSoft">Nearby delivery</span></div>

        <div className="hide-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5">
          {["all", ...categories].map((c) => <button key={c} onClick={() => setFilter(c)} className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-extrabold transition active:scale-95 ${filter === c ? "bg-charcoal text-white shadow-sm" : "bg-sand text-charcoalSoft hover:bg-orange-50 hover:text-mustard"}`}>{c === "all" ? "All" : c}</button>)}
        </div>

        {categories.map((cat) => {
          const catItems = filtered(cat); if (catItems.length === 0) return null;
          return <section key={cat} className="mt-7">
            <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-black text-charcoal">{cat}</h2><span className="text-[10px] font-bold text-charcoalSoft">{catItems.length} items</span></div>
            <div className="grid grid-cols-2 gap-3">
              {catItems.map((m) => {
                const inCart = items.find((i) => i.menuItemId === m.id);
                return <article key={m.id} className={`overflow-hidden rounded-[19px] border border-line bg-white shadow-soft ${!m.available ? "opacity-50" : ""}`}>
                  <div className="relative h-32 overflow-hidden bg-orange-50">{m.imageUrl ? <img src={m.imageUrl} className="h-full w-full object-cover" alt={m.name} /> : <div className="flex h-full items-center justify-center text-5xl">{m.imageEmoji}</div>}{!m.available && <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[9px] font-black text-chili">SOLD OUT</span>}</div>
                  <div className="p-3">
                    <p className="min-h-[34px] text-sm font-black leading-5 text-charcoal">{m.name}</p>
                    <div className="mt-2 flex items-center justify-between gap-2"><span className="text-sm font-black text-charcoal">₹{m.price}</span>
                      {!m.available ? <span className="text-[10px] font-bold text-chili">Unavailable</span> : inCart ? <div className="flex h-9 items-center overflow-hidden rounded-xl bg-chili text-white shadow-sm"><button className="h-full w-8 text-base font-black" onClick={() => changeQty(m.id, -1)}>−</button><span className="w-5 text-center text-xs font-black">{inCart.qty}</span><button className="h-full w-8 text-base font-black" onClick={() => changeQty(m.id, 1)}>+</button></div> : <button className="rounded-xl border border-mustard bg-white px-3 py-2 text-[11px] font-black text-mustard transition active:scale-95 hover:bg-orange-50" onClick={() => handleAdd(m)}>+ Add</button>}
                    </div>
                  </div>
                </article>;
              })}
            </div>
          </section>;
        })}
      </div>

      {totals.count > 0 && <button onClick={() => router.push("/cart")} className="fixed bottom-[76px] left-4 right-4 z-40 mx-auto flex max-w-[520px] items-center justify-between rounded-2xl bg-charcoal px-4 py-3.5 text-white shadow-lift active:scale-[.99]"><span className="text-xs font-bold">🛒 {totals.count} item{totals.count > 1 ? "s" : ""}</span><span className="text-sm font-black text-white">₹{totals.subtotal} · View Cart →</span></button>}
    </div>
  );
}
