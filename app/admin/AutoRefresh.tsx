"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Invisible helper — periodically re-fetches this page's server data
// so Admin doesn't have to manually refresh to see rider/order updates.
export default function AutoRefresh({ seconds = 10 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const interval = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(interval);
  }, [router, seconds]);
  return null;
}
