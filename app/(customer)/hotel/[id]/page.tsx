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
    <div className="pb-28">
      {hotel.imageUrl ? (
        <img src={hotel.imageUrl} className="h-40 w-full object-cover" alt={hotel.name} />
      ) : (
        <div className="h-40 bg-gradient-to-br from-mustard to-chili" />
      )}
      <div className="px-5 -mt-5 bg-white rounded-t-3xl relative pt-5">
        <h1 className="text-2xl font-extrabold mb-1">{hotel.name}</h1>
        <p className="text-xs text-charcoalSoft mb-5 leading-relaxed">{hotel.address}</p>

        <div className="flex gap-2 overflow-x-auto mb-3 -mx-5 px-5">
          {["all", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap flex-shrink-0 ${
                filter === c ? "bg-charcoal text-white" : "bg-sand text-charcoalSoft"
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
              <div className="flex gap-3.5 overflow-x-auto pb-2 -mx-5 px-5">
                {catItems.map((m) => {
                  const inCart = items.find((i) => i.menuItemId === m.id);
                  return (
                    <div key={m.id} className={`w-32 shrink-0 border border-line rounded-xl overflow-hidden ${!m.available ? "opacity-50" : ""}`}>
                      {m.imageUrl ? (
                        <img src={m.imageUrl} className="h-20 w-full object-cover" alt={m.name} />
                      ) : (
                        <div className="h-20 bg-gradient-to-br from-mustardLight to-chili flex items-center justify-center text-2xl text-white">
                          {m.imageEmoji}
                        </div>
                      )}
                      <div className="p-3">
                        <p className="text-xs font-bold leading-snug mb-1.5">{m.name}</p>
                        <p className="text-xs font-bold text-charcoalSoft mb-2">₹{m.price}</p>
                        {!m.available ? (
                          <p className="text-[10px] font-bold text-chili text-center py-1">Sold Out</p>
                        ) : inCart ? (
                          <div className="flex items-center justify-between bg-mustard rounded-lg overflow-hidden">
                            <button
                              className="text-white font-bold px-2.5 py-1"
                              onClick={() => changeQty(m.id, -1)}
                            >
                              −
                            </button>
                            <span className="text-white text-xs font-bold">{inCart.qty}</span>
                            <button
                              className="text-white font-bold px-2.5 py-1"
                              onClick={() => changeQty(m.id, 1)}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            className="w-full text-xs font-bold border border-mustard text-mustard rounded-lg py-1.5"
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
          className="fixed bottom-[72px] left-4 right-4 max-w-md mx-auto bg-charcoal text-white rounded-xl px-5 py-3.5 flex justify-between items-center shadow-lg"
        >
          <span className="text-xs">{totals.count} items</span>
          <span className="text-sm font-bold text-mustardLight">₹{totals.subtotal} · View Cart →</span>
        </button>
      )}
    </div>
  );
}
