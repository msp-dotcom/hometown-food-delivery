"use client";

import { useEffect, useState } from "react";
import { CartProvider } from "@/lib/cart-context";
import { LocationProvider } from "@/lib/location-context";
import Link from "next/link";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null); // null = still checking
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

  if (loggedIn === null) {
    return <div className="min-h-screen bg-sand" />; // avoid flashing login screen while checking
  }

  if (!loggedIn) {
    return (
      <div className="bg-sand min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl p-9 text-center">
          <div className="text-5xl mb-4">🍛</div>
          <h1 className="text-2xl font-extrabold mb-2">Welcome</h1>
          <p className="text-xs text-charcoalSoft mb-7 leading-relaxed">
            Enter your phone number to start ordering.
          </p>
          <input
            className="w-full border border-line rounded-lg px-4 py-3 text-sm text-center mb-4"
            placeholder="+91 98450 xxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
          <button
            onClick={login}
            className="w-full bg-chili text-white font-bold rounded-lg py-3 text-sm"
          >
            Continue
          </button>
          <p className="text-[10px] text-charcoalSoft mt-6 leading-relaxed">
            No password, no account setup. Used only to confirm your number and contact you for delivery.
          </p>
        </div>
      </div>
    );
  }

  return (
    <LocationProvider>
      <CartProvider>
        <div className="bg-[#f6f7f8] min-h-screen">
          <div className="customer-shell max-w-md mx-auto min-h-screen bg-white">
            <main className="pb-20">{children}</main>
            <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md border-t border-line bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur">
              <div className="flex">
                <Link href="/" className="flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-charcoalSoft transition-colors hover:text-mustard">
                <span className="text-lg leading-none">⌂</span>Home
                </Link>
                <Link href="/cart" className="flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-charcoalSoft transition-colors hover:text-mustard">
                <span className="text-lg leading-none">🛒</span>Cart
                </Link>
                <Link href="/track" className="flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-charcoalSoft transition-colors hover:text-mustard">
                <span className="text-lg leading-none">◎</span>Track
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </CartProvider>
    </LocationProvider>
  );
}
