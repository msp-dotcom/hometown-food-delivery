import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LocationBar from "./LocationBar";

export const dynamic = "force-dynamic";

const categoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("breakfast")) return "🍳";
  if (n.includes("drink") || n.includes("juice")) return "🥤";
  if (n.includes("fast")) return "🍔";
  if (n.includes("meal") || n.includes("rice")) return "🍛";
  if (n.includes("sweet") || n.includes("dessert")) return "🍰";
  return "🍽️";
};

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
    <div className="px-4 pt-5 sm:px-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="mb-1 text-[10px] font-black uppercase tracking-[.18em] text-mustard">Deliver to</p>
          <LocationBar />
        </div>
        <div className="ml-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-2xl shadow-sm">📍</div>
      </div>

      <section className="mb-7 rounded-[26px] bg-gradient-to-br from-[#ff6a2a] to-[#e94716] p-5 text-white shadow-lift">
        <p className="mb-1 text-xs font-bold text-white/75">LOCAL FOOD • QUICK DELIVERY</p>
        <h1 className="text-[30px] font-black leading-[1.05] tracking-tight">Hungry?<br />We’ll bring it to you.</h1>
        <p className="mt-3 max-w-[260px] text-xs leading-5 text-white/80">Order from your favourite local hotels and get it delivered nearby.</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-[11px] font-bold backdrop-blur">🍴 Fresh local favourites</div>
      </section>

      {categories.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-black text-charcoal">What are you craving?</h2>
          </div>
          <div className="hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5">
            {categories.map((c) => (
              <Link key={c} href={`/category/${encodeURIComponent(c)}`} className="flex min-w-[82px] shrink-0 flex-col items-center gap-2 rounded-2xl border border-line bg-white px-3 py-3 shadow-sm transition active:scale-95 hover:-translate-y-0.5 hover:border-mustard">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[25px] shadow-inner">{categoryIcon(c)}</span>
                <span className="max-w-[74px] truncate text-[11px] font-extrabold text-charcoal">{c}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.16em] text-charcoalSoft">Nearby favourites</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-charcoal">Hotels near you</h2>
          </div>
          <span className="rounded-full bg-sand px-3 py-1.5 text-[10px] font-bold text-charcoalSoft">{hotels.length} places</span>
        </div>

        <div className="space-y-4 pb-4">
          {hotels.map((h) => (
            <Link key={h.id} href={h.isOpen ? `/hotel/${h.id}` : "#"} className={`group block overflow-hidden rounded-[22px] border border-line bg-white shadow-soft transition active:scale-[.99] hover:-translate-y-0.5 hover:shadow-lift ${h.isOpen ? "" : "opacity-55 pointer-events-none"}`}>
              <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50">
                {h.imageUrl ? <img src={h.imageUrl} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" alt={h.name} /> : <div className="flex h-full w-full items-center justify-center text-6xl">🍽️</div>}
                <div className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black shadow-sm">
                  {h.isOpen ? <span className="text-green">● Open</span> : <span className="text-charcoalSoft">Closed</span>}
                </div>
                <div className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">🍴 Local favourite</div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-black text-charcoal">{h.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-charcoalSoft">{h.address}</p>
                  </div>
                  <span className="shrink-0 rounded-xl bg-orange-50 px-2.5 py-2 text-lg">🍛</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-charcoalSoft">
                  <span className="text-amber-500">★</span><span>Local menu</span><span>•</span><span>Nearby delivery</span>
                </div>
              </div>
            </Link>
          ))}
          {hotels.length === 0 && <p className="py-12 text-center text-sm text-charcoalSoft">No hotels yet — add one from <Link href="/admin" className="font-bold text-mustard">Admin</Link>.</p>}
        </div>
      </section>
    </div>
  );
}
