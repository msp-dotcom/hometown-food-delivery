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
      <p className="text-center text-sm text-charcoalSoft pt-24 px-6">
        🛒 Your cart is empty. Browse a hotel to add items.
      </p>
    );
  }

  return (
    <div className="px-4 pt-6 pb-8 sm:px-5">
      <p className="text-[10px] font-black uppercase tracking-[.16em] text-mustard mb-1.5">
        Your Cart {hotelNames.length > 1 ? "· 1 Trip, 1 Payment" : ""}
      </p>
      <h1 className="text-2xl font-black tracking-tight mb-6">
        {hotelNames.length} Hotel{hotelNames.length > 1 ? "s" : ""}
      </h1>

      {hotelNames.map((hn) => (
        <div key={hn} className="mb-4 overflow-hidden rounded-[20px] border border-line bg-white p-4 shadow-soft">
          <p className="mb-3 flex items-center gap-2 text-xs font-black text-charcoal">🍽 {hn}</p>
          {byHotel[hn].map((i) => (
            <div key={i.menuItemId} className="flex items-center justify-between gap-3 border-t border-line py-3 text-sm">
              <span>{i.name} × {i.qty}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">₹{i.qty * i.price}</span>
                <button onClick={() => changeQty(i.menuItemId, -1)} className="h-8 w-8 rounded-lg bg-sand text-charcoal font-black">−</button>
                <button onClick={() => changeQty(i.menuItemId, 1)} className="h-8 w-8 rounded-lg bg-sand text-charcoal font-black">+</button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {hotelNames.length > 1 && (
        <div className="mb-4 rounded-2xl bg-orange-50 p-3.5 text-xs leading-5 text-charcoalSoft">
          🛵 One rider picks up from both hotels — one delivery charge only.
        </div>
      )}

      <div className="mb-5 rounded-2xl border border-line bg-sand p-3.5">
        {locStatus !== "done" ? (
          <button
            onClick={useMyLocation}
            className="w-full text-xs font-extrabold text-mustard"
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

      <div className="mb-5 rounded-[20px] border border-line bg-white p-4 shadow-soft">
        <div className="flex justify-between py-1.5 text-sm text-charcoalSoft"><span>GST</span><span>₹{gst}</span></div>
        <div className="flex justify-between py-1.5 text-sm text-charcoalSoft">
          <span>Delivery Charge {distanceLabel && `(${distanceLabel})`}</span>
          <span>₹{deliveryFee}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-dashed border-line pt-3 text-base font-black">
          <span>Total</span><span>₹{total}</span>
        </div>
      </div>

      <p className="mb-2 mt-6 text-xs font-black">Your phone number</p>
      <input
        className="mb-4 w-full rounded-2xl border border-line bg-sand px-4 py-3.5 text-sm outline-none focus:border-mustard"
        placeholder="+91 98450 xxxxx"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <p className="mb-2 text-xs font-black">Delivery address</p>
      <input
        className="mb-4 w-full rounded-2xl border border-line bg-sand px-4 py-3.5 text-sm outline-none focus:border-mustard"
        placeholder="House / street / landmark"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <p className="mb-2 text-xs font-black">Payment</p>
      <div className="mb-6 space-y-2.5">
        {(["COD", "ONLINE"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPayment(p)}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-sm ${
              payment === p ? "border-mustard bg-orange-50 shadow-sm" : "border-line bg-white"
            }`}
          >
            {p === "COD" ? "Cash on Delivery (default)" : "Pay Online — UPI / Razorpay"}
          </button>
        ))}
      </div>

      <button
        disabled={placing}
        onClick={placeOrder}
        className="w-full rounded-2xl bg-chili py-4 text-sm font-black text-white shadow-lift disabled:opacity-60 active:scale-[.99]"
      >
        {placing ? "Placing order…" : "Place Order"}
      </button>
      <p className="text-[11px] text-charcoalSoft text-center mt-4 leading-relaxed px-4">
        Want to change or cancel? Call support directly — no self-cancel option.
      </p>
    </div>
  );
}
