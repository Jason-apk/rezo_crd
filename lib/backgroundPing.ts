import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { PermissionsAndroid, Platform } from "react-native";
import { getDeviceId } from "./deviceId";
import { supabase } from "./supabase";

async function ensureNotificationPermission() {
  if (Platform.OS === "android" && Platform.Version >= 33) {
    // Un refus n'empêche pas le partage : seule la notification est masquée
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  }
}

export const TASK_NAME = "rezo-background-ping";
const SESSION_KEY = "rezo_ping_session";

export type Session = { line: string; direction: 0 | 1 };

// Petit canal pour que l'écran sache quand un ping part (compteur, erreurs)
type Listener = (ok: boolean, message?: string) => void;
const listeners = new Set<Listener>();
export function onPingResult(cb: Listener) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

// ⚠️ defineTask doit s'exécuter au chargement du module, hors de tout composant
TaskManager.defineTask(TASK_NAME, async ({ data, error }: any) => {
  if (error) {
    listeners.forEach((l) => l(false, error.message));
    return;
  }
  const locations: Location.LocationObject[] | undefined = data?.locations;
  if (!locations?.length) return;

  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return; // pas de session active : on ne fait rien
  const session: Session = JSON.parse(raw);

  const loc = locations[locations.length - 1]; // la plus récente
  const speed = loc.coords.speed;

  const { error: rpcError } = await supabase.rpc("submit_ping", {
    p_device_hash: await getDeviceId(),
    p_line_number: session.line,
    p_direction: session.direction,
    p_lat: loc.coords.latitude,
    p_lng: loc.coords.longitude,
    p_speed_kmh: speed != null && speed >= 0 ? speed * 3.6 : null,
    p_accuracy_m: loc.coords.accuracy,
  });

  // TODO (étape 8) : si rpcError, stocker le ping localement pour le renvoyer
  listeners.forEach((l) => l(!rpcError, rpcError?.message));
});

export async function startBackgroundPing(line: string, direction: 0 | 1) {
  await ensureNotificationPermission(); // <-- nouvelle ligne

  // Android et iOS imposent deux demandes successives
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== "granted")
    throw new Error("Permission de localisation refusée");
  const bg = await Location.requestBackgroundPermissionsAsync();
  if (bg.status !== "granted") {
    throw new Error(
      "Choisis « Toujours autoriser » pour partager écran verrouillé",
    );
  }

  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ line, direction }));

  await Location.startLocationUpdatesAsync(TASK_NAME, {
    accuracy: Location.Accuracy.High, // TODO: comparer avec Balanced (batterie)
    timeInterval: 15_000, // respecté sur Android
    distanceInterval: 0,
    pausesUpdatesAutomatically: false,
    activityType: Location.ActivityType.AutomotiveNavigation,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: "REZO",
      notificationBody: "Partage de votre position dans le bus",
    },
  });
}

export async function stopBackgroundPing() {
  if (await Location.hasStartedLocationUpdatesAsync(TASK_NAME)) {
    await Location.stopLocationUpdatesAsync(TASK_NAME);
  }
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function getActiveSession(): Promise<Session | null> {
  if (!(await Location.hasStartedLocationUpdatesAsync(TASK_NAME))) return null;
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as Session) : null;
}
