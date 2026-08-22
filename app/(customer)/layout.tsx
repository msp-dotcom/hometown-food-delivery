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
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-4xl mb-3">🍛</div>
          <h1 className="text-xl font-bold mb-1">Welcome</h1>
          <p className="text-xs text-charcoalSoft mb-6">
            Enter your phone number to start ordering.
          </p>
          <input
            className="w-full border border-line rounded-lg px-3 py-2.5 text-sm text-center mb-3"
            placeholder="+91 98450 xxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
          <button
            onClick={login}
            className="w-full bg-chili text-white font-bold rounded-lg py-2.5 text-sm"
          >
            Continue
          </button>
          <p className="text-[10px] text-charcoalSoft mt-5">
            No password, no account setup. Used only to confirm your number and contact you for delivery.
          </p>
        </div>
      </div>
    );
  }

  return (
    <LocationProvider>
      <CartProvider>
        <div className="bg-sand min-h-screen">
          <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl">
            <main className="pb-16">{children}</main>
            <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-line flex">
              <Link href="/" className="flex-1 text-center py-3 text-xs font-semibold text-charcoalSoft hover:text-mustard transition-colors">
                <span className="block text-base mb-0.5">⌂</span>Home
              </Link>
              <Link href="/cart" className="flex-1 text-center py-3 text-xs font-semibold text-charcoalSoft hover:text-mustard transition-colors">
                <span className="block text-base mb-0.5">🛒</span>Cart
              </Link>
              <Link href="/track" className="flex-1 text-center py-3 text-xs font-semibold text-charcoalSoft hover:text-mustard transition-colors">
                <span className="block text-base mb-0.5">◎</span>Track
              </Link>
            </nav>
          </div>
        </div>
      </CartProvider>
    </LocationProvider>
  );
}
