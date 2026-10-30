import * as Location from "expo-location";
import { getDeviceId } from "./deviceId";
import { supabase } from "./supabase";

export async function ensureLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

export async function sendPing(lineNumber: string, direction: 0 | 1) {
  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  const speed = loc.coords.speed;
  const speedKmh = speed != null && speed >= 0 ? speed * 3.6 : null;

  const { error } = await supabase.rpc("submit_ping", {
    p_device_hash: await getDeviceId(),
    p_line_number: lineNumber,
    p_direction: direction,
    p_lat: loc.coords.latitude,
    p_lng: loc.coords.longitude,
    p_speed_kmh: speedKmh,
    p_accuracy_m: loc.coords.accuracy,
  });

  if (error) throw error;
}
