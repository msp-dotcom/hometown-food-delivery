"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";

export type CartItem = {
  menuItemId: string;
  hotelId: string;
  hotelName: string;
  name: string;
  price: number;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  changeQty: (menuItemId: string, delta: number) => void;
  clearCart: () => void;
  totals: { count: number; subtotal: number };
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const hasLoaded = useRef(false);

  // Load once on mount. The save-effect below waits for this to finish first,
  // so it never overwrites a real saved cart with the initial empty array.
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setItems(JSON.parse(saved));
    hasLoaded.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) return;
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  function addItem(item: Omit<CartItem, "qty">) {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.menuItemId);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.menuItemId ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }

  function changeQty(menuItemId: string, delta: number) {
    setItems((prev) =>
      prev
        .map((i) => (i.menuItemId === menuItemId ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  }

  function clearCart() {
    setItems([]);
  }

  const totals = {
    count: items.reduce((s, i) => s + i.qty, 0),
    subtotal: items.reduce((s, i) => s + i.qty * i.price, 0),
  };

  return (
    <CartContext.Provider value={{ items, addItem, changeQty, clearCart, totals }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
