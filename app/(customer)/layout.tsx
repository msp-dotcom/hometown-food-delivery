"use client";

import { useEffect, useState } from "react";
import { CartProvider, useCart } from "@/lib/cart-context";
import { LocationProvider } from "@/lib/location-context";
import Link from "next/link";

function BottomNav() {
  const { totals } = useCart();
  const tabs = [
    { href: "/", icon: "🏠", label: "Home" },
    { href: "/cart", icon: "🛒", label: "Cart" },
    { href: "/track", icon: "📍", label: "Track" },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-[560px] border-t border-line bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur-xl">
      {tabs.map((tab) => (
        <Link key={tab.href} href={tab.href} className="relative flex min-h-[64px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-bold text-charcoalSoft transition active:scale-95">
          <span className="text-[23px] leading-none drop-shadow-sm">{tab.icon}</span>
          <span>{tab.label}</span>
          {tab.label === "Cart" && totals.count > 0 && (
            <span className="absolute right-[24%] top-1 min-w-5 rounded-full bg-chili px-1.5 py-0.5 text-center text-[10px] font-extrabold text-white shadow-sm">{totals.count}</span>
          )}
        </Link>
      ))}
    </nav>
  );
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("customerPhone");
    setLoggedIn(!!saved);
  }, []);

  function login() {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) {
      alert("Enter a valid phone number");
      return;
    }
    localStorage.setItem("customerPhone", cleaned);
    setLoggedIn(true);
  }

  if (loggedIn === null) return <div className="min-h-screen bg-sand" />;

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-sand px-5 flex items-center justify-center">
        <div className="w-full max-w-sm rounded-[28px] bg-white p-8 text-center shadow-lift">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-50 text-5xl shadow-sm">🍛</div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[.16em] text-mustard">Hometown Food</p>
          <h1 className="mb-2 text-3xl font-black tracking-tight text-charcoal">Welcome</h1>
          <p className="mb-7 text-sm leading-6 text-charcoalSoft">Enter your phone number to start ordering.</p>
          <input className="mb-3 w-full rounded-2xl border border-line bg-sand px-4 py-3.5 text-center text-sm outline-none focus:border-mustard" placeholder="+91 98450 xxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} />
          <button onClick={login} className="w-full rounded-2xl bg-chili py-3.5 text-sm font-extrabold text-white shadow-soft active:scale-[.98]">Continue</button>
          <p className="mt-5 text-[10px] leading-5 text-charcoalSoft">No password or account setup. Your number is used to confirm and contact you for delivery.</p>
        </div>
      </div>
    );
  }

  return (
    <LocationProvider>
      <CartProvider>
        <div className="customer-shell">
          <div className="customer-frame">
            <main className="safe-bottom">{children}</main>
            <BottomNav />
          </div>
        </div>
      </CartProvider>
    </LocationProvider>
  );
}
