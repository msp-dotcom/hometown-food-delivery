import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LocationBar from "./LocationBar";

export const dynamic = "force-dynamic"; // always show live hotel data, not a cached build

export default async function HomePage() {
  const hotels = await prisma.hotel.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="px-5 pt-7 pb-2">
      <p className="text-xs font-bold tracking-wide text-mustard uppercase mb-2">
        Deliver to
      </p>
      <LocationBar />
      <h1 className="text-3xl font-extrabold mb-7 mt-5 tracking-tight leading-tight">Hungry?</h1>

      <p className="text-sm font-bold mb-3">Categories</p>
      <div className="flex gap-2.5 overflow-x-auto mb-8 pb-1 -mx-5 px-5">
        {[
          { name: "Non-Veg", emoji: "🍛" },
          { name: "Veg", emoji: "🥗" },
          { name: "Drinks", emoji: "🥤" },
          { name: "Snacks", emoji: "🥟" },
        ].map((c) => (
          <Link
            key={c.name}
            href={`/category/${encodeURIComponent(c.name)}`}
            className="flex-shrink-0 bg-sand rounded-xl px-5 py-3 text-center min-w-[72px]"
          >
            <div className="text-2xl mb-1">{c.emoji}</div>
            <div className="text-[11px] font-bold">{c.name}</div>
          </Link>
        ))}
      </div>

      <p className="text-sm font-bold mb-3">Hotels near you</p>
      <div className="space-y-5 pb-4">
        {hotels.map((h) => (
          <Link
            key={h.id}
            href={h.isOpen ? `/hotel/${h.id}` : "#"}
            className={`block border border-line rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-mustardLight transition-all ${
              h.isOpen ? "" : "opacity-50 pointer-events-none"
            }`}
          >
            <div className="h-40 w-full">
              {h.imageUrl ? (
                <img src={h.imageUrl} className="w-full h-full object-cover" alt={h.name} />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-mustardLight to-chili flex items-center justify-center text-4xl">
                  🍽
                </div>
              )}
            </div>
            <div className="p-4">
              <h4 className="text-base font-bold mb-1">{h.name}</h4>
              <span className="text-xs text-charcoalSoft leading-relaxed">
                {h.isOpen ? (
                  <span className="text-green font-semibold">Open</span>
                ) : (
                  "On leave"
                )}{" "}
                · {h.address}
              </span>
            </div>
          </Link>
        ))}
        {hotels.length === 0 && (
          <p className="text-sm text-charcoalSoft text-center py-12">
            No hotels yet — add one from{" "}
            <Link href="/admin" className="text-mustard font-semibold">
              Admin
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
