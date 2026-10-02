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
    <div className="pb-28">
      <div className="px-4 pt-6 sm:px-5">
        <button onClick={() => router.back()} className="mb-5 inline-flex rounded-full bg-sand px-3 py-2 text-xs font-bold text-charcoalSoft">
          ← Back
        </button>
        <p className="mb-1.5 text-[10px] font-black uppercase tracking-[.16em] text-mustard">Category</p>
        <h1 className="text-2xl font-black tracking-tight mb-1.5">{category}</h1>
        <p className="mb-6 text-xs leading-5 text-charcoalSoft">Items from every open hotel nearby</p>

        {loading ? (
          <p className="text-sm text-charcoalSoft">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-charcoalSoft">No {category} items available right now.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => {
              const inCart = cartItems.find((i) => i.menuItemId === item.id);
              return (
                <div key={item.id} className="overflow-hidden rounded-[19px] border border-line bg-white shadow-soft">
                  <div className="h-32 w-full">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} className="h-full w-full object-cover" alt={item.name} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-orange-50 text-5xl">
                        {item.imageEmoji}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="min-h-[34px] text-sm font-black leading-5">{item.name}</p>
                    <p className="mt-1 truncate text-[10px] font-bold text-charcoalSoft">{item.hotel.name}</p>
                    <p className="mt-2 text-sm font-black">₹{item.price}</p>

                    {inCart ? (
                      <div className="mt-2 flex h-9 items-center justify-between overflow-hidden rounded-xl bg-chili">
                        <button
                          className="h-full w-8 text-base font-black text-white"
                          onClick={() => changeQty(item.id, -1)}
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-xs font-black text-white">{inCart.qty}</span>
                        <button
                          className="h-full w-8 text-base font-black text-white"
                          onClick={() => changeQty(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        className="mt-2 w-full rounded-xl border border-mustard bg-white py-2.5 text-[11px] font-black text-mustard active:scale-95"
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
          className="fixed bottom-[76px] left-4 right-4 z-40 mx-auto flex max-w-[520px] items-center justify-between rounded-2xl bg-charcoal px-4 py-3.5 text-white shadow-lift"
        >
          <span className="text-xs font-bold">{totals.count} items</span>
          <span className="text-sm font-black text-white">₹{totals.subtotal} · View Cart →</span>
        </button>
      )}
    </div>
  );
}
