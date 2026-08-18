"use client";

import { useRouter } from "next/navigation";

export default function AssignRiderSelect({
  orderId,
  riders,
}: {
  orderId: string;
  riders: { id: string; name: string; available: boolean }[];
}) {
  const router = useRouter();

  async function assign(riderId: string) {
    if (!riderId) return;
    await fetch("/api/admin/assign", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, riderId }),
    });
    router.refresh();
  }

  return (
    <select
      onChange={(e) => assign(e.target.value)}
      defaultValue=""
      className="text-[10px] border border-[#E4DFD1] rounded px-1.5 py-1"
    >
      <option value="" disabled>
        Assign rider…
      </option>
      {riders.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name} {r.available ? "(free)" : "(busy)"}
        </option>
      ))}
    </select>
  );
}
