import { useCallback, useEffect, useState } from "react";
import {
  getActiveSession,
  onPingResult,
  Session,
  startBackgroundPing,
  stopBackgroundPing,
} from "./backgroundPing";

export function useGpsPing() {
  const [active, setActive] = useState(false);
  const [pingCount, setPingCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    return onPingResult((ok, message) => {
      if (ok) {
        setPingCount((n) => n + 1);
        setLastError(null);
      } else setLastError(message ?? "Erreur inconnue");
    });
  }, []);
  useEffect(() => {
    getActiveSession().then((s) => {
      if (s) {
        setSession(s);
        setActive(true);
      }
    });
  }, []);

  const start = useCallback(async (line: string, direction: 0 | 1) => {
    try {
      setPingCount(0);
      await startBackgroundPing(line, direction);
      setActive(true);
      setSession({ line, direction });
    } catch (e: any) {
      setLastError(e.message);
    }
  }, []);

  const stop = useCallback(async () => {
    await stopBackgroundPing();
    setActive(false);
    setSession(null);
  }, []);

  // TODO: au montage, appeler hasStartedLocationUpdatesAsync pour restaurer `active`
  // si le service tourne déjà (app rouverte pendant un trajet)

  return { active, session, pingCount, lastError, start, stop };
}
