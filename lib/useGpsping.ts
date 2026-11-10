import { useCallback, useEffect, useRef, useState } from "react";
import {
  getActiveSession,
  Session,
  startBackgroundPing,
  stopBackgroundPing,
} from "./backgroundPing";
import { getDeviceId } from "./deviceId";
import { getLocationPermissionState } from "./permissions";
import { supabase } from "./supabase";

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

const POLL_MS = 12_000; // un peu après l'intervalle de ping (15s)
const STALE_AFTER_MS = 40_000; // pas de ping depuis 40s en étant "connecté" → avertir

export function useGpsPing() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pingCount, setPingCount] = useState(0);
  const [lastPingAt, setLastPingAt] = useState<Date | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const startedAtRef = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      const s = await getActiveSession();
      if (!s) return;
      const perm = await getLocationPermissionState();
      if (perm === "granted") {
        setSession(s);
        setStatus("connected");
        startedAtRef.current = new Date().toISOString();
      } else {
        await stopBackgroundPing();
      }
    })();
  }, []);

  // Source de vérité unique : la base, interrogée régulièrement.
  // Fonctionne quel que soit le contexte JS qui a réellement écrit le ping.
  useEffect(() => {
    if (status !== "connected") return;
    let cancelled = false;

    async function poll() {
      try {
        const deviceId = await getDeviceId();
        const since = startedAtRef.current ?? new Date(0).toISOString();
        const { data, error } = await supabase.rpc("get_my_ping_count", {
          p_device_hash: deviceId,
          p_since: since,
        });
        if (error || cancelled) return;

        const count = data?.count ?? 0;
        const lastAt = data?.last_at ? new Date(data.last_at) : null;
        setPingCount(count);
        setLastPingAt(lastAt);

        if (lastAt && Date.now() - lastAt.getTime() < STALE_AFTER_MS) {
          setErrorMessage(null); // un ping récent efface toute alerte précédente
        } else if (count > 0) {
          setErrorMessage(
            "Aucun envoi récent. Vérifie ta connexion ou ta localisation.",
          );
        }
      } catch {
        // échec du sondage lui-même : pas de réseau, on réessaiera au prochain tour
      }
    }

    poll();
    const t = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [status]);

  const start = useCallback(async (line: string, direction: 0 | 1) => {
    setStatus("connecting");
    setErrorMessage(null);
    try {
      await startBackgroundPing(line, direction);
      setPingCount(0);
      setLastPingAt(null);
      startedAtRef.current = new Date().toISOString();
      setSession({ line, direction });
      setStatus("connected");
    } catch (e: any) {
      setErrorMessage(
        e.message || "Impossible de se connecter au réseau. Réessaie.",
      );
      setStatus("error");
    }
  }, []);

  const stop = useCallback(async () => {
    await stopBackgroundPing();
    setSession(null);
    setStatus("disconnected");
    setErrorMessage(null);
    setPingCount(0);
    setLastPingAt(null);
  }, []);

  return { status, errorMessage, pingCount, lastPingAt, session, start, stop };
}
