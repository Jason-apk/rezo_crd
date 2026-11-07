import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";

export type RankedBus = {
  minutes: number;
  status: "GREEN" | "ORANGE" | "RED";
  distance_m: number;
  contributors: number;
  stalled: boolean;
  reported_breakdown: boolean;
};

export type EtaResult = { buses: RankedBus[] };

const REFRESH_MS = 10_000;

export function useEta(stopId: string | null, line: string | null) {
  const [result, setResult] = useState<EtaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const stopRef = useRef(stopId);
  stopRef.current = stopId;

  const refresh = useCallback(async () => {
    const requested = stopRef.current;
    if (!requested || !line) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);

    try {
      const { data, error } = await supabase
        .rpc("get_eta", {
          p_stop_id: requested,
          p_line_number: line,
          p_direction: 0,
        })
        .abortSignal(controller.signal);

      if (error) throw error;
      if (stopRef.current !== requested) return;

      setResult(data as EtaResult);
      setOffline(false);
    } catch {
      setOffline(true);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, [line]);

  useEffect(() => {
    setResult(null);
    if (!stopId || !line) return;
    setLoading(true);
    refresh();
    const t = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(t);
  }, [stopId, line, refresh]);

  return { buses: result?.buses ?? [], loading, offline };
}
