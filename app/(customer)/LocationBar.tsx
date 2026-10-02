"use client";

import { useEffect, useRef, useState } from "react";
import { useLocation } from "@/lib/location-context";

export default function LocationBar() {
  const { addresses, selected, selectAddress, addAddress, useCurrentGPS, locating } = useLocation();
  const [open, setOpen] = useState(false);
  const [addingManual, setAddingManual] = useState(false);
  const [manualLabel, setManualLabel] = useState("");
  const [manualText, setManualText] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false); setAddingManual(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleUseGPS() { await useCurrentGPS(); setOpen(false); }
  function saveManual() {
    if (!manualLabel || !manualText) { alert("Enter both a label and the address"); return; }
    addAddress(manualLabel, manualText); setManualLabel(""); setManualText(""); setAddingManual(false); setOpen(false);
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button onClick={() => setOpen(!open)} className="flex max-w-[245px] items-center gap-2 text-left">
        <span className="max-w-[205px] truncate text-sm font-extrabold text-charcoal">{selected ? selected.label : "Set delivery location"}</span>
        <span className="text-[10px] text-charcoalSoft">▼</span>
      </button>
      <p className="mt-0.5 max-w-[245px] truncate text-[10px] font-medium text-charcoalSoft">{selected ? selected.text : "Choose current GPS location"}</p>

      {open && (
        <div className="absolute left-0 top-14 z-40 w-[min(340px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-line bg-white shadow-lift">
          {addresses.map((a) => (
            <button key={a.id} onClick={() => { selectAddress(a.id); setOpen(false); }} className="block w-full border-b border-line px-4 py-3 text-left text-sm hover:bg-sand">
              <b>{a.label}</b><span className="text-charcoalSoft"> — {a.text}</span>
            </button>
          ))}
          <button onClick={handleUseGPS} className="flex w-full items-center gap-2 border-b border-line px-4 py-3 text-left text-sm font-extrabold text-mustard hover:bg-orange-50">
            <span className="text-lg">📍</span>{locating ? "Getting location…" : "Use current GPS location"}
          </button>
          {addingManual ? (
            <div className="p-4">
              <input className="mb-2.5 w-full rounded-xl border border-line bg-sand px-3 py-2.5 text-xs outline-none focus:border-mustard" placeholder="Label (e.g. Home, Work)" value={manualLabel} onChange={(e) => setManualLabel(e.target.value)} autoFocus />
              <input className="mb-3 w-full rounded-xl border border-line bg-sand px-3 py-2.5 text-xs outline-none focus:border-mustard" placeholder="Address" value={manualText} onChange={(e) => setManualText(e.target.value)} />
              <div className="flex gap-2"><button onClick={saveManual} className="flex-1 rounded-xl bg-chili py-2.5 text-xs font-extrabold text-white">Save Address</button><button onClick={() => setAddingManual(false)} className="rounded-xl border border-line px-4 py-2.5 text-xs font-bold">Cancel</button></div>
            </div>
          ) : <button onClick={() => setAddingManual(true)} className="w-full px-4 py-3 text-left text-sm font-extrabold text-mustard hover:bg-orange-50">+ Add new address</button>}
        </div>
      )}
    </div>
  );
}
