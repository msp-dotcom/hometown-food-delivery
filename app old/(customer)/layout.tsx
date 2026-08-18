import { CartProvider } from "@/lib/cart-context";
import Link from "next/link";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
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
  );
}