import * as Location from "expo-location";
import { getDeviceId } from "./deviceId";
import { ensureLocationPermission } from "./pings";
import { supabase } from "./supabase";

export type ReportType = "FULL" | "BREAKDOWN";

export async function sendReport(
  line: string,
  direction: 0 | 1,
  type: ReportType,
): Promise<"ok" | "duplicate" | "not_on_board"> {
  if (!(await ensureLocationPermission())) {
    throw new Error("Permission de localisation refusée");
  }
  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const { data, error } = await supabase.rpc("submit_report", {
    p_device_hash: await getDeviceId(),
    p_line_number: line,
    p_direction: direction,
    p_type: type,
    p_lat: loc.coords.latitude,
    p_lng: loc.coords.longitude,
  });
  if (error) throw error;
  return data as "ok" | "duplicate" | "not_on_board";
}
