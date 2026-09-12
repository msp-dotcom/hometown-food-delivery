"use client";

import { useEffect, useState } from "react";

type LibraryImage = { name: string; label: string; url: string };

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

  useEffect(() => {
    fetch("/api/admin/image-library")
      .then((r) => r.json())
      .then((data) => {
        setImages(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const filtered = images.filter((i) => i.label.toLowerCase().includes(search.toLowerCase()));

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
            className="w-full border border-[#E4DFD1] rounded-lg px-3 py-2 text-xs"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <p className="text-xs text-[#68706B]">Loading images…</p>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-[#68706B]">
              No images found. Upload some to the "menu-images" bucket first (via cmd or the upload
              button), then they'll show up here.
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
