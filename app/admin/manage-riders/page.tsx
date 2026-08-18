"use client";

import { useEffect, useState } from "react";

type Rider = { id: string; name: string; phone: string; available: boolean };

export default function ManageRidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  function load() {
    fetch("/api/admin/manage-riders")
      .then((r) => r.json())
      .then(setRiders);
  }
  useEffect(load, []);

  async function addRider() {
    if (!form.name || !form.phone) {
      alert("Name and phone are required");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/manage-riders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setForm({ name: "", phone: "" });
      load();
    } else {
      const err = await res.json();
      alert(err.error || "Could not add rider");
    }
  }

  return (
    <div>
      <p className="text-[10px] font-bold tracking-wide text-[#B87A1F] uppercase mb-1">Operations</p>
      <h1 className="text-2xl font-extrabold mb-1">Manage Riders</h1>
      <p className="text-xs text-[#68706B] mb-6">
        Rider accounts are created here only — riders never self-register. Phone number is what
        they'll log in with at /rider.
      </p>

      <div className="bg-white border border-[#E4DFD1] rounded-xl p-5 mb-5">
        <p className="text-sm font-extrabold mb-3">Add Rider</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            className="border border-[#E4DFD1] rounded-lg px-3 py-2 text-sm"
            placeholder="Rider name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="border border-[#E4DFD1] rounded-lg px-3 py-2 text-sm"
            placeholder="Phone (10 digits, or with +91)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <button
          disabled={saving}
          onClick={addRider}
          className="bg-[#DE9A34] text-[#241802] text-sm font-bold rounded-lg px-4 py-2"
        >
          {saving ? "Saving…" : "+ Add Rider"}
        </button>
      </div>

      <div className="bg-white border border-[#E4DFD1] rounded-xl p-5">
        <p className="text-sm font-extrabold mb-3">Current Riders</p>
        {riders.length === 0 ? (
          <p className="text-xs text-[#68706B]">No riders added yet.</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] uppercase text-[#68706B] border-b border-[#E4DFD1]">
                <th className="py-2">Name</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {riders.map((r) => (
                <tr key={r.id} className="border-b border-[#E4DFD1] last:border-0">
                  <td className="py-2 font-bold">{r.name}</td>
                  <td className="font-mono">{r.phone}</td>
                  <td>
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        r.available ? "bg-[#2E7D6B]/10 text-[#2E7D6B]" : "bg-[#E4DFD1] text-[#68706B]"
                      }`}
                    >
                      {r.available ? "Available" : "Off duty / Busy"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
