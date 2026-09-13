"use client";

import { useEffect, useState } from "react";

type LibraryImage = { name: string; category: string; label: string; url: string };

export default function BulkAddFromLibrary({
  hotelId,
  onDone,
  onClose,
}: {
  hotelId: string;
  onDone: () => void;
  onClose: () => void;
}) {
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [libraryCategory, setLibraryCategory] = useState("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [menuCategory, setMenuCategory] = useState("Non-Veg");
  const [defaultPrice, setDefaultPrice] = useState("100");
  const [adding, setAdding] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    fetch("/api/admin/image-library")
      .then((r) => r.json())
      .then((data) => {
        setImages(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const categories = ["All", ...Array.from(new Set(images.map((i) => i.category))).sort()];
  const filtered = images.filter((i) => libraryCategory === "All" || i.category === libraryCategory);

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function selectAllVisible() {
    setSelected(new Set(filtered.map((i) => i.name)));
  }

  async function addSelected() {
    if (selected.size === 0) {
      alert("Select at least one image first");
      return;
    }
    const price = parseInt(defaultPrice) || 100;
    const toAdd = images.filter((i) => selected.has(i.name));

    setAdding(true);
    setProgress({ done: 0, total: toAdd.length });

    for (let i = 0; i < toAdd.length; i++) {
      const img = toAdd[i];
      await fetch(`/api/hotels/${hotelId}/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: img.label,
          price,
          category: menuCategory,
          imageUrl: img.url,
        }),
      });
      setProgress({ done: i + 1, total: toAdd.length });
    }

    setAdding(false);
    onDone();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-line">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-extrabold">Bulk Add Items from Library</p>
            <button onClick={onClose} className="text-xs text-charcoalSoft">
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-[10px] font-bold text-charcoalSoft block mb-1">Menu category (applies to all selected)</label>
              <select
                className="w-full border border-line rounded-lg px-2 py-2 text-xs"
                value={menuCategory}
                onChange={(e) => setMenuCategory(e.target.value)}
              >
                <option>Non-Veg</option>
                <option>Veg</option>
                <option>Drinks</option>
                <option>Snacks</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-charcoalSoft block mb-1">Default price (₹) — edit later</label>
              <input
                className="w-full border border-line rounded-lg px-2 py-2 text-xs"
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setLibraryCategory(c)}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 ${
                  libraryCategory === c ? "bg-charcoal text-white" : "bg-sand text-charcoalSoft"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pt-3 flex justify-between items-center">
          <p className="text-[11px] text-charcoalSoft">{selected.size} selected</p>
          <button onClick={selectAllVisible} className="text-[11px] font-bold text-mustard">
            Select all shown ({filtered.length})
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <p className="text-xs text-charcoalSoft">Loading images…</p>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-charcoalSoft">No images in this category. Upload some first via Admin → Image Library.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filtered.map((img) => {
                const isSelected = selected.has(img.name);
                return (
                  <button
                    key={img.name}
                    onClick={() => toggle(img.name)}
                    className={`text-left border-2 rounded-lg overflow-hidden relative ${
                      isSelected ? "border-mustard" : "border-line"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-mustard text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10">
                        ✓
                      </div>
                    )}
                    <img src={img.url} className="w-full h-20 object-cover" alt={img.label} />
                    <p className="text-[10px] font-semibold p-1.5 leading-tight truncate">{img.label}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-line">
          <button
            disabled={adding || selected.size === 0}
            onClick={addSelected}
            className="w-full bg-mustard text-white text-sm font-bold rounded-lg py-3 disabled:opacity-50"
          >
            {adding
              ? `Adding ${progress.done}/${progress.total}…`
              : `Add ${selected.size} Item${selected.size !== 1 ? "s" : ""} to Menu`}
          </button>
        </div>
      </div>
    </div>
  );
}
