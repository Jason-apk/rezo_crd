import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";

export type ReportSummary = {
  type: "BREAKDOWN";
  count: number;
  last_at: string;
};

export type Eta = {
  minutes: number | null;
  status: "GREEN" | "ORANGE" | "RED";
  source: "live" | "none";
  contributors: number;
  distance_m?: number;
  last_ping_at?: string;
  reports?: ReportSummary[];
};

const REFRESH_MS = 10_000;

export function useEta(
  stopId: string | null,
  line: string | null,
  direction: 0 | 1,
) {
  const [eta, setEta] = useState<Eta | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
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
          p_direction: direction,
        })
        .abortSignal(controller.signal);

      if (error) throw error;
      if (stopRef.current !== requested) return;

      setEta(data as Eta);
      setUpdatedAt(new Date());
      setOffline(false);
    } catch {
      setOffline(true);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, [line, direction]);

  useEffect(() => {
    setEta(null);
    if (!stopId || !line) return;
    setLoading(true);
    refresh();
    const t = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(t);
  }, [stopId, line, direction, refresh]);

  return { eta, loading, updatedAt, offline };
}
