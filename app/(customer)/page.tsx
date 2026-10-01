import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LocationBar from "./LocationBar";

export const dynamic = "force-dynamic"; // always show live hotel data, not a cached build

export default async function HomePage() {
  const hotels = await prisma.hotel.findMany({ orderBy: { createdAt: "desc" } });
  const categoryRows = await prisma.menuItem.findMany({
    where: { available: true, hotel: { isOpen: true } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  const categories = categoryRows.map((c) => c.category);

  return (
    <div className="customer-page px-5 pt-6 pb-8">
      <p className="section-label mb-2">
        Deliver to
      </p>
      <LocationBar />
      <div className="mb-7 mt-5"><h1 className="text-[30px] font-extrabold tracking-[-0.04em] leading-tight text-charcoal">Hungry?</h1><p className="mt-1 text-sm text-charcoalSoft">Find something delicious nearby.</p></div>

      {categories.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3"><p className="section-title">Categories</p></div>
          <div className="flex gap-2 overflow-x-auto mb-8 pb-1 -mx-5 px-5 scrollbar-none">
            {categories.map((c) => (
              <Link
                key={c}
                href={`/category/${encodeURIComponent(c)}`}
                className="flex-shrink-0 rounded-full border border-line bg-white px-4 py-2.5 text-xs font-bold text-charcoal shadow-sm transition active:scale-[0.98] hover:border-mustard hover:text-mustard"
              >
                {c}
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="flex items-center justify-between mb-3"><p className="section-title">Hotels near you</p><span className="text-xs text-charcoalSoft">Local picks</span></div>
      <div className="space-y-4 pb-4">
        {hotels.map((h) => (
          <Link
            key={h.id}
            href={h.isOpen ? `/hotel/${h.id}` : "#"}
            className={`group block border border-line rounded-2xl overflow-hidden bg-white shadow-[0_4px_18px_rgba(23,33,43,0.06)] hover:shadow-md hover:border-mustardLight transition-all ${
              h.isOpen ? "" : "opacity-50 pointer-events-none"
            }`}
          >
            <div className="h-44 w-full bg-sand">
              {h.imageUrl ? (
                <img src={h.imageUrl} className="w-full h-full object-cover" alt={h.name} />
              ) : (
                <div className="w-full h-full bg-[#fff1eb] flex items-center justify-center text-4xl">
                  🍽
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3"><h4 className="text-[16px] font-bold leading-snug">{h.name}</h4><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${h.isOpen ? "bg-green/10 text-green" : "bg-sand text-charcoalSoft"}`}>{h.isOpen ? "Open" : "Closed"}</span></div>
              <span className="mt-1 block text-xs leading-relaxed text-charcoalSoft">{h.address}</span>
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
