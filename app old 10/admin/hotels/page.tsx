"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Hotel = {
  id: string;
  name: string;
  phone: string;
  address: string;
  isOpen: boolean;
  latitude: number | null;
  longitude: number | null;
};

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  function loadHotels() {
    fetch("/api/hotels")
      .then((r) => r.json())
      .then(setHotels);
  }
  useEffect(loadHotels, []);

  function captureLocation() {
    if (!navigator.geolocation) {
      alert("Location isn't available in this browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        alert("Couldn't get location — you can still add the hotel and set location later");
        setLocating(false);
      },
      { timeout: 10000 }
    );
  }

  async function addHotel() {
    if (!form.name || !form.phone || !form.address) {
      alert("Name, phone, and address are required");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/hotels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        latitude: coords?.lat,
        longitude: coords?.lng,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setForm({ name: "", phone: "", address: "" });
      setCoords(null);
      loadHotels();
    }
  }

  async function toggleOpen(hotel: Hotel) {
    await fetch(`/api/hotels/${hotel.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOpen: !hotel.isOpen }),
    });
    loadHotels();
  }

  async function setLocationForExisting(hotel: Hotel) {
    if (!navigator.geolocation) {
      alert("Location isn't available in this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await fetch(`/api/hotels/${hotel.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        });
        loadHotels();
      },
      () => alert("Couldn't get your current location"),
      { timeout: 10000 }
    );
  }

  async function removeHotel(hotel: Hotel) {
    if (!confirm(`Remove ${hotel.name}? This also removes its menu items.`)) return;
    await fetch(`/api/hotels/${hotel.id}`, { method: "DELETE" });
    loadHotels();
  }

  return (
    <div className="px-4 pt-6">
      <p className="text-xs font-bold text-mustard uppercase mb-1">Admin</p>
      <h1 className="text-xl font-bold mb-4">Hotels</h1>

      <div className="border border-line rounded-xl p-3 mb-5">
        <p className="text-sm font-bold mb-2">Add Hotel</p>
        <input
          className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-2"
          placeholder="Hotel name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-2"
          placeholder="Phone (WhatsApp number)"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-3"
          placeholder="Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <div className="bg-sand rounded-lg p-2.5 mb-3">
          {coords ? (
            <p className="text-xs text-charcoalSoft">
              📍 Location captured ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
            </p>
          ) : (
            <button
              onClick={captureLocation}
              disabled={locating}
              className="text-xs font-bold text-mustard"
            >
              {locating ? "Getting location…" : "📍 Stand at the hotel & tap to set location"}
            </button>
          )}
          <p className="text-[10px] text-charcoalSoft mt-1">
            Needed for showing km distance and calculating delivery fees correctly. Can be set later too.
          </p>
        </div>

        <button
          disabled={saving}
          onClick={addHotel}
          className="bg-mustard text-white text-sm font-bold rounded-lg px-4 py-2"
        >
          {saving ? "Saving…" : "+ Add Hotel"}
        </button>
      </div>

      <div className="space-y-2">
        {hotels.map((h) => (
          <div key={h.id} className="flex items-center justify-between border border-line rounded-xl p-3">
            <div>
              <p className="text-sm font-bold">{h.name}</p>
              <p className="text-[11px] text-charcoalSoft">{h.phone}</p>
              {h.latitude == null ? (
                <button
                  onClick={() => setLocationForExisting(h)}
                  className="text-[10px] font-bold text-chili mt-1"
                >
                  ⚠ No location set — tap to set (stand at hotel first)
                </button>
              ) : (
                <p className="text-[10px] text-charcoalSoft mt-1">
                  📍 {h.latitude.toFixed(4)}, {h.longitude?.toFixed(4)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleOpen(h)}
                className={`text-[11px] font-bold px-2 py-1 rounded-full ${
                  h.isOpen ? "bg-green/10 text-green" : "bg-chili/10 text-chili"
                }`}
              >
                {h.isOpen ? "Open" : "Closed"}
              </button>
              <Link href={`/admin/menu/${h.id}`} className="text-xs font-bold text-mustard">
                Edit menu →
              </Link>
              <button
                onClick={() => removeHotel(h)}
                className="text-xs font-bold text-chili"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
