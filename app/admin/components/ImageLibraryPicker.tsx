"use client";

import { useEffect, useState } from "react";

type LibraryImage = { name: string; category: string; label: string; url: string };

export default function ImageLibraryPicker({
  onSelect,
  onClose,
}: {
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetch("/api/admin/image-library")
      .then((r) => r.json())
      .then((data) => {
        setImages(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const categories = ["All", ...Array.from(new Set(images.map((i) => i.category))).sort()];

  const filtered = images.filter(
    (i) =>
      (activeCategory === "All" || i.category === activeCategory) &&
      i.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[#E4DFD1]">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-extrabold">Choose from Image Library</p>
            <button onClick={onClose} className="text-xs text-[#68706B]">
              ✕ Close
            </button>
          </div>
          <input
            className="w-full border border-[#E4DFD1] rounded-lg px-3 py-2 text-xs mb-3"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 ${
                  activeCategory === c ? "bg-[#141C22] text-white" : "bg-[#F3F4F6] text-[#68706B]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <p className="text-xs text-[#68706B]">Loading images…</p>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-[#68706B]">
              No images found in this category. Upload some via the upload-images.bat script first, then
              they'll show up here.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filtered.map((img) => (
                <button
                  key={img.name}
                  onClick={() => onSelect(img.url)}
                  className="text-left border border-[#E4DFD1] rounded-lg overflow-hidden hover:border-[#DE9A34]"
                >
                  <img src={img.url} className="w-full h-20 object-cover" alt={img.label} />
                  <p className="text-[10px] font-semibold p-1.5 leading-tight">{img.label}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
