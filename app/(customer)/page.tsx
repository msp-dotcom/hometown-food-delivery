import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LocationBar from "./LocationBar";

export const dynamic = "force-dynamic"; // always show live hotel data, not a cached build

export default async function HomePage() {
  const hotels = await prisma.hotel.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="px-4 pt-6">
      <p className="text-xs font-bold tracking-wide text-mustard uppercase mb-1">
        Deliver to
      </p>
      <LocationBar />
      <h1 className="text-3xl font-extrabold mb-5 tracking-tight">Hungry?</h1>

      <p className="text-sm font-bold mb-2">Hotels near you</p>
      <div className="space-y-3">
        {hotels.map((h) => (
          <Link
            key={h.id}
            href={h.isOpen ? `/hotel/${h.id}` : "#"}
            className={`flex items-center gap-3 border border-line rounded-xl p-3 shadow-sm hover:shadow-md hover:border-mustardLight transition-all ${
              h.isOpen ? "" : "opacity-50 pointer-events-none"
            }`}
          >
            <div className="w-14 h-14 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
              {h.imageUrl ? (
                <img src={h.imageUrl} className="w-full h-full object-cover" alt={h.name} />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-mustardLight to-chili flex items-center justify-center text-2xl">
                  🍽
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold">{h.name}</h4>
              <span className="text-xs text-charcoalSoft">
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
          <p className="text-sm text-charcoalSoft text-center py-10">
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
