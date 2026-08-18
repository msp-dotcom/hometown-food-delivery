"use client";

import { useEffect, useState } from "react";

type MenuItem = { id: string; name: string; price: number; category: string; imageEmoji: string };

const CATEGORIES = ["Non-Veg", "Veg", "Drinks", "Snacks"];

export default function AdminMenuPage({ params }: { params: { hotelId: string } }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [hotelName, setHotelName] = useState("");
  const [form, setForm] = useState({ name: "", price: "", category: "Non-Veg" });
  const [editingId, setEditingId] = useState<string | null>(null);

  function load() {
    fetch(`/api/hotels/${params.hotelId}`)
      .then((r) => r.json())
      .then((h) => {
        setHotelName(h.name);
        setItems(h.menuItems);
      });
  }
  useEffect(load, [params.hotelId]);

  async function addItem() {
    if (!form.name || !form.price) {
      alert("Name and price are required");
      return;
    }
    await fetch(`/api/hotels/${params.hotelId}/menu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", price: "", category: "Non-Veg" });
    load();
  }

  async function saveEdit(item: MenuItem) {
    await fetch(`/api/menu/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    setEditingId(null);
    load();
  }

  return (
    <div className="px-4 pt-6">
      <p className="text-xs font-bold text-mustard uppercase mb-1">Digital Menu · {hotelName}</p>
      <h1 className="text-xl font-bold mb-4">Menu Items</h1>

      <div className="border border-line rounded-xl p-3 mb-5">
        <p className="text-sm font-bold mb-2">Add item</p>
        <input
          className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-2"
          placeholder="Item name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-2"
          placeholder="Price (₹)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <select
          className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-3"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button onClick={addItem} className="bg-mustard text-white text-sm font-bold rounded-lg px-4 py-2">
          + Add Item
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) =>
          editingId === item.id ? (
            <div key={item.id} className="border border-mustard rounded-xl p-3">
              <input
                className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-2"
                value={item.name}
                onChange={(e) =>
                  setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, name: e.target.value } : i)))
                }
              />
              <input
                className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-2"
                value={item.price}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((i) => (i.id === item.id ? { ...i, price: Number(e.target.value) } : i))
                  )
                }
              />
              <div className="flex gap-2">
                <button
                  onClick={() => saveEdit(item)}
                  className="bg-mustard text-white text-xs font-bold rounded-lg px-3 py-2"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="border border-line text-xs font-bold rounded-lg px-3 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div key={item.id} className="flex items-center gap-3 border-b border-line py-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-mustard to-chili flex items-center justify-center text-lg">
                {item.imageEmoji}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">{item.name}</p>
                <p className="text-[11px] text-charcoalSoft">{item.category}</p>
              </div>
              <span className="text-sm font-bold">₹{item.price}</span>
              <button
                onClick={() => setEditingId(item.id)}
                className="text-xs font-bold text-mustard ml-2"
              >
                Edit
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
