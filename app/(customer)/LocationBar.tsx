"use client";

import { useState } from "react";
import { useLocation } from "@/lib/location-context";

export default function LocationBar() {
  const { addresses, selected, selectAddress, addAddress, useCurrentGPS, locating } = useLocation();
  const [open, setOpen] = useState(false);
  const [addingManual, setAddingManual] = useState(false);
  const [manualLabel, setManualLabel] = useState("");
  const [manualText, setManualText] = useState("");

  function saveManual() {
    if (!manualLabel || !manualText) {
      alert("Enter both a label and the address");
      return;
    }
    addAddress(manualLabel, manualText);
    setManualLabel("");
    setManualText("");
    setAddingManual(false);
    setOpen(false);
  }

  return (
    <div className="mb-3">
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between bg-sand rounded-xl px-3 py-2.5 cursor-pointer"
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          📍 {selected ? `${selected.label} — ${selected.text}` : "Set your delivery location"}
        </div>
        <span className="text-xs text-charcoalSoft">{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div className="border border-line rounded-xl mt-1.5 overflow-hidden shadow-md bg-white">
          {addresses.map((a) => (
            <div
              key={a.id}
              onClick={() => {
                selectAddress(a.id);
                setOpen(false);
              }}
              className="px-4 py-2.5 text-sm border-b border-line cursor-pointer hover:bg-sand"
            >
              <b>{a.label}</b> — {a.text}
            </div>
          ))}

          <div
            onClick={useCurrentGPS}
            className="px-4 py-2.5 text-sm border-b border-line cursor-pointer hover:bg-sand text-mustard font-semibold"
          >
            {locating ? "Getting location…" : "🎯 Use current GPS location"}
          </div>

          {addingManual ? (
            <div className="p-3">
              <input
                className="w-full border border-line rounded-lg px-3 py-2 text-xs mb-2"
                placeholder="Label (e.g. Home, Work)"
                value={manualLabel}
                onChange={(e) => setManualLabel(e.target.value)}
              />
              <input
                className="w-full border border-line rounded-lg px-3 py-2 text-xs mb-2"
                placeholder="Address"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
              />
              <button
                onClick={saveManual}
                className="w-full bg-mustard text-white text-xs font-bold rounded-lg py-2"
              >
                Save Address
              </button>
            </div>
          ) : (
            <div
              onClick={() => setAddingManual(true)}
              className="px-4 py-2.5 text-sm cursor-pointer hover:bg-sand font-semibold text-mustard"
            >
              + Add new address
            </div>
          )}
        </div>
      )}
    </div>
  );
}
