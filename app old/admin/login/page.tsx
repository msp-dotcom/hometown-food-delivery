"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function login() {
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const err = await res.json();
      setError(err.error || "Login failed");
    }
  }

  return (
    <div className="min-h-screen bg-[#101820] flex items-center justify-center p-6">
      <div className="w-full max-w-xs bg-white rounded-xl p-6">
        <div className="text-center mb-6">
          <div className="text-sm font-extrabold tracking-wide" style={{ color: "#101820" }}>
            HOMETOWN <span style={{ color: "#DE9A34" }}>OPS</span>
          </div>
          <p className="text-xs text-[#68706B] mt-1">Admin login</p>
        </div>
        <input
          type="password"
          className="w-full border border-[#E4DFD1] rounded-lg px-3 py-2.5 text-sm mb-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
        />
        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-[#141C22] text-white font-bold rounded-lg py-2.5 text-sm"
        >
          {loading ? "Checking…" : "Login"}
        </button>
        {error && <p className="text-[11px] text-[#B4483A] mt-3">{error}</p>}
      </div>
    </div>
  );
}
