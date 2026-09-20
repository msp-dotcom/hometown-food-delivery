"use client";

import { useRouter } from "next/navigation";

const STATUSES = ["PLACED", "ACCEPTED", "PREPARING", "READY", "PICKED_UP", "DELIVERED"];

export default function OrderStatusControl({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();

  async function updateStatus(newStatus: string) {
    if (!newStatus) return;
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  }

  async function cancelOrder() {
    if (!confirm("Cancel this order? This should only be done after speaking with the customer.")) return;
    updateStatus("CANCELLED");
  }

  if (status === "CANCELLED" || status === "DELIVERED") {
    return (
      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#E4DFD1] text-[#68706B]">
        {status}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={status}
        onChange={(e) => updateStatus(e.target.value)}
        className="text-[10px] border border-[#E4DFD1] rounded px-1.5 py-1"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button onClick={cancelOrder} className="text-[10px] font-bold text-[#B4483A]">
        Cancel
      </button>
    </div>
  );
}
