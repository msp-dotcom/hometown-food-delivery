"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  imageEmoji: string;
};
type Hotel = { id: string; name: string; address: string; menuItems: MenuItem[] };

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

  const categories = ["Non-Veg", "Veg", "Drinks", "Snacks"];
  const filtered = (cat: string) =>
    hotel.menuItems.filter((m) => m.category === cat && (filter === "all" || filter === cat));

  return (
    <div className="pb-24">
      <div className="h-24 bg-gradient-to-br from-mustard to-chili" />
      <div className="px-4 -mt-4 bg-white rounded-t-2xl relative pt-4">
        <h1 className="text-xl font-bold">{hotel.name}</h1>
        <p className="text-xs text-charcoalSoft mb-3">{hotel.address}</p>

        <div className="flex gap-2 overflow-x-auto mb-2">
          {["all", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap ${
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
            <div key={cat} className="mt-4">
              <p className="text-sm font-bold mb-2">{cat}</p>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {catItems.map((m) => {
                  const inCart = items.find((i) => i.menuItemId === m.id);
                  return (
                    <div key={m.id} className="w-28 shrink-0 border border-line rounded-xl overflow-hidden">
                      <div className="h-16 bg-gradient-to-br from-mustardLight to-chili flex items-center justify-center text-2xl text-white">
                        {m.imageEmoji}
                      </div>
                      <div className="p-2">
                        <p className="text-[11px] font-bold leading-tight mb-1">{m.name}</p>
                        <p className="text-[11px] font-bold text-charcoalSoft mb-1.5">₹{m.price}</p>
                        {inCart ? (
                          <div className="flex items-center justify-between bg-mustard rounded-md overflow-hidden">
                            <button
                              className="text-white font-bold px-2 py-0.5"
                              onClick={() => changeQty(m.id, -1)}
                            >
                              −
                            </button>
                            <span className="text-white text-xs font-bold">{inCart.qty}</span>
                            <button
                              className="text-white font-bold px-2 py-0.5"
                              onClick={() => changeQty(m.id, 1)}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            className="w-full text-[11px] font-bold border border-mustard text-mustard rounded-md py-1"
                            onClick={() =>
                              addItem({
                                menuItemId: m.id,
                                hotelId: hotel.id,
                                hotelName: hotel.name,
                                name: m.name,
                                price: m.price,
                              })
                            }
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
          className="fixed bottom-16 left-4 right-4 max-w-md mx-auto bg-charcoal text-white rounded-xl px-4 py-3 flex justify-between items-center"
        >
          <span className="text-xs">{totals.count} items</span>
          <span className="text-sm font-bold text-mustardLight">₹{totals.subtotal} · View Cart →</span>
        </button>
      )}
    </div>
  );
}
