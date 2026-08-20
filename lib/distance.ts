// Straight-line distance between two lat/lng points, in kilometers.
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Our finalized formula: ₹20 flat for the first km, +₹15 for every km after that,
// rounded up to the next full km.
export function computeDeliveryFee(distanceKm: number): number {
  if (distanceKm <= 1) return 20;
  return 20 + Math.ceil(distanceKm - 1) * 15;
}

// Total route distance across multiple stops in order (e.g. Hotel A -> Hotel B -> Customer),
// used for combined multi-hotel trips.
export function computeRouteDistance(stops: { lat: number; lng: number }[]): number {
  let total = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    total += haversineKm(stops[i].lat, stops[i].lng, stops[i + 1].lat, stops[i + 1].lng);
  }
  return total;
}
