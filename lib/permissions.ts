import * as Location from "expo-location";

export type PermissionState = "granted" | "denied" | "unknown";

// Lit l'état actuel SANS déclencher de popup — utile pour informer l'utilisateur
// avant même qu'il appuie sur un bouton.
export async function getLocationPermissionState(): Promise<PermissionState> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === "granted") return "granted";
    if (status === "denied") return "denied";
    return "unknown";
  } catch {
    return "unknown";
  }
}
