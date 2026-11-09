import { useCallback, useEffect, useState } from "react";
import {
  getActiveSession,
  onPingResult,
  Session,
  startBackgroundPing,
  stopBackgroundPing,
} from "./backgroundPing";
import { humanizePingError } from "./errorMessages";
import { getLocationPermissionState } from "./permissions";

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export function useGpsPing() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pingCount, setPingCount] = useState(0);
  const [lastPingAt, setLastPingAt] = useState<Date | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  // Au montage : une session tournait déjà ? On vérifie que la permission tient TOUJOURS,
  // on ne fait jamais confiance à l'ancien état seul.
  useEffect(() => {
    (async () => {
      const s = await getActiveSession();
      if (!s) return;
      const perm = await getLocationPermissionState();
      if (perm === "granted") {
        setSession(s);
        setStatus("connected");
      } else {
        await stopBackgroundPing(); // pas de session "fantôme" qui semble active sans l'être
        setErrorMessage(
          "La localisation a été désactivée. Reconnecte-toi pour reprendre le partage.",
        );
      }
    })();
  }, []);

  useEffect(() => {
    return onPingResult((ok, message) => {
      if (ok) {
        setPingCount((n) => n + 1);
        setLastPingAt(new Date());
        setErrorMessage(null); // un ping réussi efface une erreur transitoire précédente
      } else if (message) {
        setErrorMessage(humanizePingError(message));
      }
    });
  }, []);

  const start = useCallback(async (line: string, direction: 0 | 1) => {
    setStatus("connecting");
    setErrorMessage(null); // on efface tout message précédent dès qu'on retente
    try {
      await startBackgroundPing(line, direction);
      setPingCount(0);
      setLastPingAt(null);
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
  }, []);

  return { status, errorMessage, pingCount, lastPingAt, session, start, stop };
}
