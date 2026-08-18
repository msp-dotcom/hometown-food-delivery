"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { items, changeQty, totals, clearCart } = useCart();
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<"COD" | "ONLINE">("COD");
  const [placing, setPlacing] = useState(false);
  const router = useRouter();

  const byHotel: Record<string, typeof items> = {};
  items.forEach((i) => {
    (byHotel[i.hotelName] = byHotel[i.hotelName] || []).push(i);
  });
  const hotelNames = Object.keys(byHotel);
  const gst = Math.round(totals.subtotal * 0.05);
  const deliveryFee = hotelNames.length > 1 ? 35 : 30;
  const total = totals.subtotal + gst + deliveryFee;

  async function placeOrder() {
    if (!phone || !address) {
      alert("Phone and delivery address are required");
      return;
    }
    setPlacing(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        deliveryAddress: address,
        paymentMethod: payment,
        items: items.map((i) => ({ menuItemId: i.menuItemId, qty: i.qty })),
      }),
    });
    setPlacing(false);
    if (res.ok) {
      clearCart();
      router.push(`/track?phone=${encodeURIComponent(phone)}`);
    } else {
      const err = await res.json();
      alert(err.error || "Could not place order");
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-center text-sm text-charcoalSoft pt-24 px-6">
        🛒 Your cart is empty. Browse a hotel to add items.
      </p>
    );
  }

  return (
    <div className="px-4 pt-6">
      <p className="text-xs font-bold text-mustard uppercase mb-1">
        Your Cart {hotelNames.length > 1 ? "· 1 Trip, 1 Payment" : ""}
      </p>
      <h1 className="text-xl font-bold mb-4">
        {hotelNames.length} Hotel{hotelNames.length > 1 ? "s" : ""}
      </h1>

      {hotelNames.map((hn) => (
        <div key={hn} className="border border-mustardLight rounded-xl p-3 mb-3">
          <p className="text-xs font-bold text-mustard mb-1">🍽 {hn}</p>
          {byHotel[hn].map((i) => (
            <div key={i.menuItemId} className="flex justify-between items-center text-sm py-1">
              <span>{i.name} × {i.qty}</span>
              <div className="flex items-center gap-2">
                <span>₹{i.qty * i.price}</span>
                <button onClick={() => changeQty(i.menuItemId, -1)} className="text-charcoalSoft">−</button>
                <button onClick={() => changeQty(i.menuItemId, 1)} className="text-charcoalSoft">+</button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {hotelNames.length > 1 && (
        <div className="bg-sand rounded-lg p-2 text-xs text-charcoalSoft mb-3">
          🛵 One rider picks up from both hotels — one delivery charge only.
        </div>
      )}

      <div className="flex justify-between text-sm py-1"><span>GST</span><span>₹{gst}</span></div>
      <div className="flex justify-between text-sm py-1"><span>Delivery Charge</span><span>₹{deliveryFee}</span></div>
      <div className="flex justify-between font-bold text-base border-t border-dashed border-line mt-2 pt-2">
        <span>Total</span><span>₹{total}</span>
      </div>

      <p className="text-xs font-bold mt-4 mb-1">Your phone number</p>
      <input
        className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-3"
        placeholder="+91 98450 xxxxx"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <p className="text-xs font-bold mb-1">Delivery address</p>
      <input
        className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-3"
        placeholder="House / street / landmark"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <p className="text-xs font-bold mb-1">Payment</p>
      <div className="space-y-2 mb-4">
        {(["COD", "ONLINE"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPayment(p)}
            className={`w-full text-left text-sm border rounded-lg px-3 py-2 ${
              payment === p ? "border-mustard bg-orange-50" : "border-line"
            }`}
          >
            {p === "COD" ? "Cash on Delivery (default)" : "Pay Online — UPI / Razorpay"}
          </button>
        ))}
      </div>

      <button
        disabled={placing}
        onClick={placeOrder}
        className="w-full bg-chili text-white font-bold rounded-xl py-3 disabled:opacity-60"
      >
        {placing ? "Placing order…" : "Place Order"}
      </button>
      <p className="text-[11px] text-charcoalSoft text-center mt-3">
        Want to change or cancel? Call support directly — no self-cancel option.
      </p>
    </div>
  );
}
