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
    <div className="pb-24">
      <div className="px-5 pt-7">
        <button onClick={() => router.back()} className="text-xs text-charcoalSoft mb-4">
          ← Back
        </button>
        <p className="text-xs font-bold text-mustard uppercase mb-1.5">Category</p>
        <h1 className="text-2xl font-extrabold mb-1.5">{category}</h1>
        <p className="text-xs text-charcoalSoft mb-6 leading-relaxed">Items from every open hotel nearby</p>

        {loading ? (
          <p className="text-sm text-charcoalSoft">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-charcoalSoft">No {category} items available right now.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {items.map((item) => {
              const inCart = cartItems.find((i) => i.menuItemId === item.id);
              return (
                <div key={item.id} className="border border-line rounded-xl overflow-hidden">
                  <div className="h-24 w-full">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-mustardLight to-chili flex items-center justify-center text-2xl text-white">
                        {item.imageEmoji}
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-bold leading-tight mb-0.5">{item.name}</p>
                    <p className="text-[10px] text-charcoalSoft mb-1.5">{item.hotel.name}</p>
                    <p className="text-xs font-bold mb-2">₹{item.price}</p>

                    {inCart ? (
                      <div className="flex items-center justify-between bg-mustard rounded-md overflow-hidden">
                        <button
                          className="text-white font-bold px-2 py-0.5"
                          onClick={() => changeQty(item.id, -1)}
                        >
                          −
                        </button>
                        <span className="text-white text-xs font-bold">{inCart.qty}</span>
                        <button
                          className="text-white font-bold px-2 py-0.5"
                          onClick={() => changeQty(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        className="w-full text-[11px] font-bold border border-mustard text-mustard rounded-md py-1"
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
          className="fixed bottom-16 left-4 right-4 max-w-md mx-auto bg-charcoal text-white rounded-xl px-4 py-3 flex justify-between items-center"
        >
          <span className="text-xs">{totals.count} items</span>
          <span className="text-sm font-bold text-mustardLight">₹{totals.subtotal} · View Cart →</span>
        </button>
      )}
    </div>
  );
}
