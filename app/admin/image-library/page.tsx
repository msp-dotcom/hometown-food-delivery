"use client";

import { useEffect, useState } from "react";

type LibraryImage = { name: string; category: string; label: string; url: string };

export default function ImageLibraryAdminPage() {
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [filterCategory, setFilterCategory] = useState("All");

  function load() {
    setLoading(true);
    fetch("/api/admin/image-library")
      .then((r) => r.json())
      .then((data) => {
        setImages(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }
  useEffect(load, []);

  async function uploadAll() {
    if (!category.trim()) {
      alert("Enter a category name first (e.g. Fast Food, Breakfast, Drinks)");
      return;
    }
    if (!files || files.length === 0) {
      alert("Choose one or more images first");
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) {
      alert("Image storage isn't configured — missing Supabase env vars");
      return;
    }

    setUploading(true);
    setProgress({ done: 0, total: files.length });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const cleanName = file.name.replace(/\s+/g, "-");
      const objectName = `${category.trim()}__${Date.now()}-${cleanName}`;
      try {
        await fetch(`${supabaseUrl}/storage/v1/object/menu-images/${objectName}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${anonKey}`,
            apikey: anonKey,
            "Content-Type": file.type,
          },
          body: file,
        });
      } catch {
        // continue with the rest even if one fails
      }
      setProgress({ done: i + 1, total: files.length });
    }

    setUploading(false);
    setFiles(null);
    load();
  }

  async function removeImage(img: LibraryImage) {
    if (!confirm(`Remove "${img.label}"? This can't be undone.`)) return;
    await fetch("/api/admin/image-library", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: img.name }),
    });
    load();
  }

  const categories = ["All", ...Array.from(new Set(images.map((i) => i.category))).sort()];
  const filtered = images.filter((i) => filterCategory === "All" || i.category === filterCategory);

  return (
    <div>
      <p className="text-[10px] font-bold tracking-wide text-[#B87A1F] uppercase mb-1">Digital Menu</p>
      <h1 className="text-2xl font-extrabold mb-1">Image Library</h1>
      <p className="text-xs text-[#68706B] mb-6">
        Bulk-upload a whole category of photos at once, then remove individual ones anytime.
      </p>

      <div className="bg-white border border-[#E4DFD1] rounded-xl p-5 mb-6">
        <p className="text-sm font-extrabold mb-3">Bulk Upload</p>

        <label className="text-[10px] font-bold text-[#68706B] block mb-1">Category name</label>
        <input
          className="w-full border border-[#E4DFD1] rounded-lg px-3 py-2.5 text-sm mb-3"
          placeholder="e.g. Fast Food, Breakfast, Drinks"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <label className="text-[10px] font-bold text-[#68706B] block mb-1">Choose images</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(e.target.files)}
          className="w-full text-xs mb-1"
        />
        {files && (
          <p className="text-[10px] text-[#68706B] mb-3">{files.length} file(s) selected</p>
        )}

        <button
          disabled={uploading}
          onClick={uploadAll}
          className="bg-[#DE9A34] text-[#241802] text-sm font-bold rounded-lg px-4 py-2 mt-2"
        >
          {uploading ? `Uploading ${progress.done}/${progress.total}…` : "Upload All"}
        </button>
      </div>

      <div className="bg-white border border-[#E4DFD1] rounded-xl p-5">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-extrabold">Current Images <span className="text-[#68706B] font-normal text-xs">({filtered.length})</span></p>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 ${
                filterCategory === c ? "bg-[#141C22] text-white" : "bg-[#F3F4F6] text-[#68706B]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-xs text-[#68706B]">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-[#68706B]">No images in this category yet.</p>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {filtered.map((img) => (
              <div key={img.name} className="border border-[#E4DFD1] rounded-lg overflow-hidden">
                <img src={img.url} className="w-full h-20 object-cover" alt={img.label} />
                <p className="text-[10px] font-semibold px-1.5 pt-1.5 leading-tight truncate">{img.label}</p>
                <button
                  onClick={() => removeImage(img)}
                  className="w-full text-[10px] font-bold text-[#B4483A] py-1"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
