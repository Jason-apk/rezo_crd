import { getStops } from "./stops";

const EARTH_RADIUS_M = 6371000;

function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Distance au terminus (dernier arrêt de la ligne) — sert à l'arrêt automatique
export function distanceToTerminus(
  line: string,
  lat: number,
  lon: number,
): number | null {
  const stops = getStops(line);
  const terminus = stops[stops.length - 1];
  if (!terminus) return null;
  return haversineMeters(lat, lon, terminus.lat, terminus.lon);
}

// Distance au plus proche arrêt de la ligne — sert à la vérification "es-tu bien sur cette ligne"
export function distanceToNearestStop(
  line: string,
  lat: number,
  lon: number,
): number | null {
  const stops = getStops(line);
  if (stops.length === 0) return null;
  let min = Infinity;
  for (const s of stops) {
    const d = haversineMeters(lat, lon, s.lat, s.lon);
    if (d < min) min = d;
  }
  return min;
}
