"use client";

import { useEffect, useState } from "react";

type Rider = { id: string; name: string; phone: string; available: boolean };

export default function RiderPage() {
  const [rider, setRider] = useState<Rider | null>(null);
  const [phone, setPhone] = useState("");
  const [loginError, setLoginError] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [contactUnlocked, setContactUnlocked] = useState(false);

  // Restore session from localStorage so rider stays logged in (matches "OTP once" pattern)
  useEffect(() => {
    const saved = localStorage.getItem("riderId");
    const savedName = localStorage.getItem("riderName");
    const savedPhone = localStorage.getItem("riderPhone");
    if (saved && savedName && savedPhone) {
      setRider({ id: saved, name: savedName, phone: savedPhone, available: false });
    }
  }, []);

  // Poll for the rider's active order
  useEffect(() => {
    if (!rider) return;
    const load = () =>
      fetch(`/api/rider/orders?riderId=${rider.id}`)
        .then((r) => r.json())
        .then(setOrder);
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [rider]);

  async function login() {
    setLoginError("");
    const res = await fetch("/api/rider/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    if (!res.ok) {
      const err = await res.json();
      setLoginError(err.error || "Login failed");
      return;
    }
    const data: Rider = await res.json();
    localStorage.setItem("riderId", data.id);
    localStorage.setItem("riderName", data.name);
    localStorage.setItem("riderPhone", data.phone);
    setRider(data);
  }

  async function toggleDuty() {
    if (!rider) return;
    const newAvailable = !rider.available;
    await fetch("/api/rider/duty", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ riderId: rider.id, available: newAvailable }),
    });
    setRider({ ...rider, available: newAvailable });
  }

  async function updateStatus(status: string) {
    if (!order) return;
    await fetch(`/api/rider/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (status === "DELIVERED") {
      setOrder(null);
      setRider(rider ? { ...rider, available: true } : rider);
    } else {
      setOrder({ ...order, status });
    }
  }

  function reachedCustomer() {
    setContactUnlocked(false);
    setTimeout(() => setContactUnlocked(true), 180000); // 3 min, matches our design
  }

  // ---------- LOGIN SCREEN ----------
  if (!rider) {
    return (
      <div className="p-8 text-center pt-16">
        <div className="text-4xl mb-3">🛵</div>
        <h1 className="text-lg font-extrabold mb-1">Rider Login</h1>
        <p className="text-xs text-[#68706B] mb-6">
          Enter the phone number Admin registered you with.
        </p>
        <input
          className="w-full border border-[#E4DFD1] rounded-lg px-3 py-2.5 text-sm text-center mb-3 bg-white"
          placeholder="10-digit number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button
          onClick={login}
          className="w-full bg-[#141C22] text-white font-bold rounded-lg py-2.5 text-sm"
        >
          Login
        </button>
        {loginError && (
          <div className="mt-4 text-left bg-[#F5E3E0] border border-[#E3B6AC] rounded-lg p-3 text-[11px] text-[#7A2E23]">
            {loginError}
          </div>
        )}
        <p className="text-[10px] text-[#68706B] mt-6">
          Rider accounts are created by Admin — only registered numbers can log in here.
        </p>
      </div>
    );
  }

  const busy = !!order;

  // ---------- MAIN SCREEN ----------
  return (
    <div className="p-4">
      <div className="flex justify-between items-center bg-white border border-[#E4DFD1] rounded-xl p-3 mb-4">
        <div>
          <p className="text-sm font-extrabold">{rider.name}</p>
          <p className="text-[10px] text-[#68706B]">
            {busy ? "On duty · Busy (auto-locked)" : rider.available ? "On duty · Available" : "Off duty"}
          </p>
        </div>
        <button
          onClick={toggleDuty}
          disabled={busy}
          className={`w-12 h-7 rounded-full relative transition-colors ${
            rider.available ? "bg-[#2E7D6B]" : "bg-[#E4DFD1]"
          } ${busy ? "opacity-50" : ""}`}
        >
          <span
            className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all ${
              rider.available ? "left-5" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {!order ? (
        <div className="text-center py-16 text-[#68706B] text-sm">
          🛵 No active order right now.
          <br />
          Stay on duty to get assigned the next one.
        </div>
      ) : (
        <div className="bg-white border border-[#E4DFD1] rounded-xl p-4">
          <p className="text-[10px] text-[#68706B] mb-1">
            ORDER <b className="text-[#1B2126]">#{order.id.slice(-6).toUpperCase()}</b>
          </p>
          <p className="text-sm font-extrabold mb-3">
            {Array.from(new Set(order.items.map((i: any) => i.hotel.name))).join(" → ")} → Customer
          </p>

          <div className="text-xs text-[#68706B] mb-4">
            {order.items.map((i: any) => (
              <div key={i.id}>
                {i.menuItem.name} × {i.quantity} — {i.hotel.name}
              </div>
            ))}
          </div>

          {order.status === "ACCEPTED" && (
            <button
              onClick={() => updateStatus("PICKED_UP")}
              className="w-full bg-[#141C22] text-white font-bold rounded-lg py-2.5 text-sm"
            >
              Mark Picked Up
            </button>
          )}

          {order.status === "PICKED_UP" && (
            <>
              <button
                onClick={reachedCustomer}
                className="w-full border border-[#E4DFD1] font-bold rounded-lg py-2.5 text-sm mb-2"
              >
                Mark Reached Customer
              </button>
              <div className="flex gap-2">
                <button
                  disabled={!contactUnlocked}
                  className={`flex-1 font-bold rounded-lg py-2.5 text-sm ${
                    contactUnlocked ? "bg-[#2E7D6B] text-white" : "bg-[#E4DFD1] text-[#68706B]"
                  }`}
                >
                  📞 Call Customer
                </button>
                <button
                  onClick={() => updateStatus("DELIVERED")}
                  className="flex-1 bg-[#141C22] text-white font-bold rounded-lg py-2.5 text-sm"
                >
                  Mark Delivered
                </button>
              </div>
              <p className="text-[10px] text-[#68706B] text-center mt-2">
                {contactUnlocked
                  ? "Customer hasn't called — Call button unlocked."
                  : "Number stays hidden — waiting for customer to call first."}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
