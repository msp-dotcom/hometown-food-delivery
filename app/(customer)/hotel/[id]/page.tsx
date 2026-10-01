"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { haversineKm } from "@/lib/distance";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  imageEmoji: string;
  imageUrl?: string | null;
  available: boolean;
};
type Hotel = {
  id: string;
  name: string;
  address: string;
  imageUrl?: string | null;
  latitude: number | null;
  longitude: number | null;
  menuItems: MenuItem[];
};

const MAX_COMBINE_KM = 2; // matches our finalized multi-hotel distance rule

export default function HotelPage({ params }: { params: { id: string } }) {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [filter, setFilter] = useState("all");
  const { items, addItem, changeQty, totals } = useCart();
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/hotels/${params.id}`)
      .then((r) => r.json())
      .then(setHotel);
  }, [params.id]);

  if (!hotel) return <p className="p-6 text-sm text-charcoalSoft">Loading menu…</p>;

  const categories = Array.from(new Set(hotel.menuItems.map((m) => m.category))).sort();
  const filtered = (cat: string) =>
    hotel.menuItems.filter((m) => m.category === cat && (filter === "all" || filter === cat));

  async function handleAdd(m: MenuItem) {
    // Multi-hotel distance rule: if the cart already has items from a different
    // hotel, only allow combining if the two hotels are within our max distance.
    const otherHotelId = items.find((i) => i.hotelId !== hotel!.id)?.hotelId;
    if (otherHotelId) {
      const res = await fetch(`/api/hotels?ids=${otherHotelId},${hotel!.id}`);
      const both = await res.json();
      const a = both.find((h: any) => h.id === otherHotelId);
      const b = both.find((h: any) => h.id === hotel!.id);
      if (!a?.latitude || !b?.latitude) {
        alert(
          "Can't combine with your current cart yet — one of the hotels doesn't have a location set. Place this as a separate order instead."
        );
        return;
      }
      const distanceKm = haversineKm(a.latitude, a.longitude, b.latitude, b.longitude);
      if (distanceKm > MAX_COMBINE_KM) {
        alert(
          `This hotel is ${distanceKm.toFixed(1)} km from your other cart items — too far to combine into one delivery. Please place it as a separate order.`
        );
        return;
      }
    }

    addItem({
      menuItemId: m.id,
      hotelId: hotel!.id,
      hotelName: hotel!.name,
      name: m.name,
      price: m.price,
    });
  }

  return (
    <div className="customer-page pb-28">
      {hotel.imageUrl ? (
        <img src={hotel.imageUrl} className="h-48 w-full object-cover" alt={hotel.name} />
      ) : (
        <div className="h-48 bg-[#fff1eb]" />
      )}
      <div className="relative -mt-6 rounded-t-[28px] bg-white px-5 pt-6">
        <h1 className="text-[24px] font-extrabold tracking-[-0.03em] mb-1">{hotel.name}</h1>
        <p className="text-xs text-charcoalSoft mb-5 leading-relaxed">{hotel.address}</p>

        <div className="flex gap-2 overflow-x-auto mb-3 -mx-5 px-5 scrollbar-none">
          {["all", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`min-h-10 text-xs font-bold px-4 rounded-full whitespace-nowrap flex-shrink-0 ${
                filter === c ? "bg-charcoal text-white shadow-sm" : "bg-sand text-charcoalSoft border border-line"
              }`}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>

        {categories.map((cat) => {
          const catItems = filtered(cat);
          if (catItems.length === 0) return null;
          return (
            <div key={cat} className="mt-7">
              <p className="text-sm font-bold mb-3">{cat}</p>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-none">
                {catItems.map((m) => {
                  const inCart = items.find((i) => i.menuItemId === m.id);
                  return (
                    <div key={m.id} className={`w-[154px] shrink-0 border border-line rounded-2xl overflow-hidden bg-white shadow-[0_3px_14px_rgba(23,33,43,0.05)] ${!m.available ? "opacity-50" : ""}`}>
                      {m.imageUrl ? (
                        <img src={m.imageUrl} className="h-24 w-full object-cover" alt={m.name} />
                      ) : (
                        <div className="h-24 bg-[#fff1eb] flex items-center justify-center text-2xl">
                          {m.imageEmoji}
                        </div>
                      )}
                      <div className="p-3.5">
                        <p className="text-[13px] font-bold leading-snug mb-1.5 line-clamp-2">{m.name}</p>
                        <p className="text-sm font-bold text-charcoal mb-2">₹{m.price}</p>
                        {!m.available ? (
                          <p className="text-[10px] font-bold text-chili text-center py-1">Sold Out</p>
                        ) : inCart ? (
                          <div className="flex items-center justify-between bg-mustard rounded-lg overflow-hidden">
                            <button
                              className="touch-button text-white font-bold px-2.5 py-1"
                              onClick={() => changeQty(m.id, -1)}
                            >
                              −
                            </button>
                            <span className="text-white text-xs font-bold">{inCart.qty}</span>
                            <button
                              className="touch-button text-white font-bold px-2.5 py-1"
                              onClick={() => changeQty(m.id, 1)}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            className="w-full min-h-10 text-xs font-bold border border-mustard text-mustard rounded-xl py-1.5 active:scale-[0.98]"
                            onClick={() => handleAdd(m)}
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {totals.count > 0 && (
        <button
          onClick={() => router.push("/cart")}
          className="fixed bottom-[74px] left-4 right-4 z-30 mx-auto max-w-md bg-charcoal text-white rounded-2xl px-5 py-3.5 flex justify-between items-center shadow-[0_12px_30px_rgba(23,33,43,0.22)]"
        >
          <span className="text-xs">{totals.count} items</span>
          <span className="text-sm font-bold text-mustardLight">₹{totals.subtotal} · View Cart →</span>
        </button>
      )}
    </div>
  );
}
