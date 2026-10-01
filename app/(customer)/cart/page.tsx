"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useLocation } from "@/lib/location-context";
import { computeRouteDistance, computeDeliveryFee } from "@/lib/distance";

type HotelCoord = { id: string; latitude: number | null; longitude: number | null };

export default function CartPage() {
  const { items, changeQty, totals, clearCart } = useCart();
  const { selected } = useLocation();
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<"COD" | "ONLINE">("COD");
  const [placing, setPlacing] = useState(false);
  const [hotelCoords, setHotelCoords] = useState<HotelCoord[]>([]);
  const [customerLoc, setCustomerLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locStatus, setLocStatus] = useState<"idle" | "loading" | "denied" | "done">("idle");
  const router = useRouter();

  // Pre-fill from the login phone number and the selected saved address
  useEffect(() => {
    const savedPhone = localStorage.getItem("customerPhone");
    if (savedPhone) setPhone(savedPhone);
  }, []);
  useEffect(() => {
    if (selected) {
      setAddress(selected.text);
      if (selected.lat && selected.lng) {
        setCustomerLoc({ lat: selected.lat, lng: selected.lng });
        setLocStatus("done");
      }
    }
  }, [selected]);

  const byHotel: Record<string, typeof items> = {};
  items.forEach((i) => {
    (byHotel[i.hotelName] = byHotel[i.hotelName] || []).push(i);
  });
  const hotelNames = Object.keys(byHotel);
  const hotelIds = Array.from(new Set(items.map((i) => i.hotelId)));

  // Fetch this cart's hotels' coordinates so we can calculate real distance
  useEffect(() => {
    if (hotelIds.length === 0) return;
    fetch(`/api/hotels?ids=${hotelIds.join(",")}`)
      .then((r) => r.json())
      .then(setHotelCoords);
  }, [hotelIds.join(",")]);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocStatus("denied");
      return;
    }
    setLocStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomerLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocStatus("done");
      },
      () => setLocStatus("denied"),
      { timeout: 10000 }
    );
  }

  const gst = Math.round(totals.subtotal * 0.05);

  let deliveryFee = 30; // fallback until real location is available
  let distanceLabel = "";
  if (customerLoc && hotelCoords.length > 0) {
    const stops = [
      ...hotelCoords
        .filter((h) => h.latitude != null && h.longitude != null)
        .map((h) => ({ lat: h.latitude as number, lng: h.longitude as number })),
      { lat: customerLoc.lat, lng: customerLoc.lng },
    ];
    if (stops.length >= 2) {
      const distanceKm = computeRouteDistance(stops);
      deliveryFee = computeDeliveryFee(distanceKm);
      distanceLabel = `${distanceKm.toFixed(1)} km`;
    }
  }

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
        customerLat: customerLoc?.lat,
        customerLng: customerLoc?.lng,
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center"><div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff1eb] text-3xl">🛒</div><p className="text-sm text-charcoalSoft">
        🛒 Your cart is empty. Browse a hotel to add items.</p></div>
    );
  }

  return (
    <div className="customer-page px-5 pt-6 pb-8">
      <p className="section-label mb-1.5">
        Your Cart {hotelNames.length > 1 ? "· 1 Trip, 1 Payment" : ""}
      </p>
      <h1 className="text-[26px] font-extrabold tracking-[-0.03em] mb-6">
        {hotelNames.length} Hotel{hotelNames.length > 1 ? "s" : ""}
      </h1>

      {hotelNames.map((hn) => (
        <div key={hn} className="mb-4 rounded-2xl border border-line bg-white p-4 shadow-[0_3px_14px_rgba(23,33,43,0.05)]">
          <div className="mb-3 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff1eb] text-sm">🍽</span><p className="text-sm font-bold">{hn}</p></div>
          {byHotel[hn].map((i) => (
            <div key={i.menuItemId} className="flex items-center justify-between gap-3 border-t border-line py-3 text-sm first:border-t-0">
              <div className="min-w-0"><span className="block truncate font-medium">{i.name}</span><span className="text-[11px] text-charcoalSoft">Qty {i.qty}</span></div>
              <div className="flex items-center gap-2">
                <span className="font-bold whitespace-nowrap">₹{i.qty * i.price}</span>
                <button onClick={() => changeQty(i.menuItemId, -1)} className="touch-button flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-sand text-charcoalSoft">−</button>
                <button onClick={() => changeQty(i.menuItemId, 1)} className="touch-button flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-sand text-charcoalSoft">+</button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {hotelNames.length > 1 && (
        <div className="mb-4 rounded-2xl border border-[#f1dfd6] bg-[#fff8f5] p-3.5 text-xs leading-relaxed text-charcoalSoft">
          🛵 One rider picks up from both hotels — one delivery charge only.
        </div>
      )}

      <div className="mb-5 rounded-2xl border border-line bg-sand p-4">
        {locStatus !== "done" ? (
          <button
            onClick={useMyLocation}
            className="w-full min-h-11 rounded-xl bg-white px-3 text-xs font-bold text-mustard shadow-sm border border-line"
          >
            {locStatus === "loading" ? "Getting your location…" : "📍 Use my location for accurate delivery fee"}
          </button>
        ) : (
          <p className="text-xs text-charcoalSoft leading-relaxed">
            📍 Location set — delivery fee calculated for {distanceLabel}.
          </p>
        )}
        {locStatus === "denied" && (
          <p className="text-[10px] text-chili mt-1.5">
            Couldn't get location — using a standard fee instead.
          </p>
        )}
      </div>

      <div className="mb-5 rounded-2xl border border-line bg-white p-4 shadow-[0_3px_14px_rgba(23,33,43,0.04)]">
        <div className="flex justify-between py-1.5 text-sm"><span className="text-charcoalSoft">GST</span><span>₹{gst}</span></div>
        <div className="flex justify-between py-1.5 text-sm">
          <span>Delivery Charge {distanceLabel && `(${distanceLabel})`}</span>
          <span>₹{deliveryFee}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-line pt-4 text-base font-extrabold">
          <span>Total</span><span>₹{total}</span>
        </div>
      </div>

      <p className="text-xs font-bold mb-2 mt-6">Your phone number</p>
      <input
        className="w-full min-h-12 rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-mustard focus:ring-2 focus:ring-mustard/10 mb-4"
        placeholder="+91 98450 xxxxx"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <p className="text-xs font-bold mb-2">Delivery address</p>
      <input
        className="w-full min-h-12 rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-mustard focus:ring-2 focus:ring-mustard/10 mb-4"
        placeholder="House / street / landmark"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <p className="text-xs font-bold mb-2">Payment</p>
      <div className="space-y-2.5 mb-6">
        {(["COD", "ONLINE"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPayment(p)}
            className={`w-full text-left text-sm border rounded-lg px-4 py-3 ${
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
        className="w-full min-h-12 bg-mustard text-white font-bold rounded-xl py-3.5 shadow-sm active:scale-[0.99] disabled:opacity-60"
      >
        {placing ? "Placing order…" : "Place Order"}
      </button>
      <p className="text-[11px] text-charcoalSoft text-center mt-4 leading-relaxed px-4">
        Want to change or cancel? Call support directly — no self-cancel option.
      </p>
    </div>
  );
}
