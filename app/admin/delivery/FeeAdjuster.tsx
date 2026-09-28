"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FeeAdjuster({ orderId, currentFee }: { orderId: string; currentFee: number }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(currentFee));
  const router = useRouter();

  async function save() {
    const fee = parseInt(value);
    if (isNaN(fee) || fee < 0) {
      alert("Enter a valid fee");
      return;
    }
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveryFee: fee }),
    });
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="font-mono underline decoration-dotted">
        ₹{currentFee}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        className="w-14 border border-[#E4DFD1] rounded px-1 py-0.5 text-[10px] font-mono"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
      />
      <button onClick={save} className="text-[10px] font-bold text-[#2E7D6B]">
        ✓
      </button>
      <button onClick={() => setEditing(false)} className="text-[10px] font-bold text-[#B4483A]">
        ✕
      </button>
    </div>
  );
}
