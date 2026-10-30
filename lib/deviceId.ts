import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomUUID } from "expo-crypto";

const STORAGE_KEY = "rezo_device_hash";

// On cache la promesse (pas la valeur) pour éviter de générer
// deux ids si deux appels arrivent en même temps au premier lancement.
let pending: Promise<string> | null = null;

async function loadOrCreate(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) return stored;

    const id = randomUUID();
    await AsyncStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch (e) {
    // Stockage indisponible : id temporaire pour cette session,
    // l'app continue de fonctionner au lieu de planter.
    console.warn("deviceId: stockage indisponible", e);
    return randomUUID();
  }
}

export function getDeviceId(): Promise<string> {
  if (!pending) pending = loadOrCreate();
  return pending;
}
