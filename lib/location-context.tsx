"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";

export type SavedAddress = {
  id: string;
  label: string;
  text: string;
  lat?: number;
  lng?: number;
};

type LocationContextType = {
  addresses: SavedAddress[];
  selected: SavedAddress | null;
  selectAddress: (id: string) => void;
  addAddress: (label: string, text: string, lat?: number, lng?: number) => void;
  useCurrentGPS: () => void;
  locating: boolean;
};

const LocationContext = createContext<LocationContextType | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [locating, setLocating] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("addresses");
    const savedSelected = localStorage.getItem("selectedAddressId");
    if (saved) setAddresses(JSON.parse(saved));
    if (savedSelected) setSelectedId(savedSelected);
    hasLoaded.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) return;
    localStorage.setItem("addresses", JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    if (!hasLoaded.current) return;
    localStorage.setItem("selectedAddressId", selectedId);
  }, [selectedId]);

  function selectAddress(id: string) {
    setSelectedId(id);
  }

  function addAddress(label: string, text: string, lat?: number, lng?: number) {
    const id = `addr_${Date.now()}`;
    setAddresses((prev) => [...prev, { id, label, text, lat, lng }]);
    setSelectedId(id);
  }

  function useCurrentGPS() {
    if (!navigator.geolocation) {
      alert("Location isn't available in this browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        addAddress(
          "Current Location",
          `GPS location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
          pos.coords.latitude,
          pos.coords.longitude
        );
        setLocating(false);
      },
      () => {
        alert("Couldn't get your location");
        setLocating(false);
      },
      { timeout: 10000 }
    );
  }

  const selected = addresses.find((a) => a.id === selectedId) || null;

  return (
    <LocationContext.Provider
      value={{ addresses, selected, selectAddress, addAddress, useCurrentGPS, locating }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used inside <LocationProvider>");
  return ctx;
}
