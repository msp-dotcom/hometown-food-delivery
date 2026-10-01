"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";

type Item = {
  id: string;
  name: string;
  price: number;
  imageEmoji: string;
  imageUrl?: string | null;
  hotel: { id: string; name: string; latitude: number | null; longitude: number | null };
};

export default function CategoryPage({ params }: { params: { name: string } }) {
  const category = decodeURIComponent(params.name);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const { items: cartItems, addItem, changeQty, totals } = useCart();
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/menu?category=${encodeURIComponent(category)}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      });
  }, [category]);

  return (
    <div className="customer-page pb-24">
      <div className="px-5 pt-7">
        <button onClick={() => router.back()} className="mb-5 inline-flex min-h-10 items-center rounded-full border border-line bg-white px-4 text-xs font-semibold text-charcoalSoft shadow-sm">
          ← Back
        </button>
        <p className="section-label mb-1.5">Category</p>
        <h1 className="text-[25px] font-extrabold tracking-[-0.03em] mb-1.5">{category}</h1>
        <p className="text-xs text-charcoalSoft mb-6 leading-relaxed">Items from every open hotel nearby</p>

        {loading ? (
          <p className="text-sm text-charcoalSoft">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-charcoalSoft">No {category} items available right now.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => {
              const inCart = cartItems.find((i) => i.menuItemId === item.id);
              return (
                <div key={item.id} className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_3px_14px_rgba(23,33,43,0.05)]">
                  <div className="h-28 w-full bg-sand">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                    ) : (
                      <div className="w-full h-full bg-[#fff1eb] flex items-center justify-center text-2xl">
                        {item.imageEmoji}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[13px] font-bold leading-tight mb-1 line-clamp-2">{item.name}</p>
                    <p className="text-[10px] text-charcoalSoft mb-1.5">{item.hotel.name}</p>
                    <p className="text-sm font-bold mb-2.5">₹{item.price}</p>

                    {inCart ? (
                      <div className="flex min-h-10 items-center justify-between bg-mustard rounded-xl overflow-hidden">
                        <button
                          className="touch-button text-white font-bold px-2 py-0.5"
                          onClick={() => changeQty(item.id, -1)}
                        >
                          −
                        </button>
                        <span className="text-white text-xs font-bold">{inCart.qty}</span>
                        <button
                          className="touch-button text-white font-bold px-2 py-0.5"
                          onClick={() => changeQty(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        className="w-full min-h-10 text-[11px] font-bold border border-mustard text-mustard rounded-xl py-1 active:scale-[0.98]"
                        onClick={() =>
                          addItem({
                            menuItemId: item.id,
                            hotelId: item.hotel.id,
                            hotelName: item.hotel.name,
                            name: item.name,
                            price: item.price,
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
        )}
      </div>

      {totals.count > 0 && (
        <button
          onClick={() => router.push("/cart")}
          className="fixed bottom-[74px] left-4 right-4 z-30 mx-auto max-w-md bg-charcoal text-white rounded-2xl px-4 py-3.5 flex justify-between items-center shadow-[0_12px_30px_rgba(23,33,43,0.22)]"
        >
          <span className="text-xs">{totals.count} items</span>
          <span className="text-sm font-bold text-mustardLight">₹{totals.subtotal} · View Cart →</span>
        </button>
      )}
    </div>
  );
}
