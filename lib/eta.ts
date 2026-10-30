import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";

export type ReportSummary = {
  type: "FULL" | "BREAKDOWN";
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
  reports?: ReportSummary[]; // signalements du prochain bus
};
export type StopItem = { id: string; name: string; sequence: number };

export async function fetchStops(
  line: string,
  direction: 0 | 1,
): Promise<StopItem[]> {
  const { data, error } = await supabase
    .from("line_stops")
    .select(
      "stop_sequence, bus_stops(id, stop_name), bus_lines!inner(line_number)",
    )
    .eq("bus_lines.line_number", line)
    .eq("direction", direction)
    .order("stop_sequence");

  if (error) throw error;

  return (data ?? []).map((row: any) => {
    // bus_stops arrive comme objet ou comme tableau selon la relation détectée
    const stop = Array.isArray(row.bus_stops)
      ? row.bus_stops[0]
      : row.bus_stops;
    return { id: stop.id, name: stop.stop_name, sequence: row.stop_sequence };
  });
}

const REFRESH_MS = 10_000;

export function useEta(
  stopId: string | null,
  line: string | null,
  direction: 0 | 1,
) {
  const [eta, setEta] = useState<Eta | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [offline, setOffline] = useState(false);
  const stopRef = useRef(stopId);
  stopRef.current = stopId;

  const refresh = useCallback(async () => {
    const requested = stopRef.current;
    if (!requested) return;

    // Si le serveur ne répond pas en 8 s, on considère qu'on est hors-ligne.
    // 8 s < 10 s (intervalle) : deux requêtes ne peuvent donc jamais s'empiler.
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
      if (stopRef.current !== requested || !line) return; // l'utilisateur a changé d'arrêt entre-temps

      setEta(data as Eta);
      setUpdatedAt(new Date());
      setOffline(false);
    } catch {
      // On NE vide PAS `eta` : on garde la dernière valeur connue
      setOffline(true);
    } finally {
      clearTimeout(timeout);
    }
  }, [line, direction]);

  useEffect(() => {
    setEta(null); // changement d'arrêt : l'ancienne valeur serait fausse
    if (!stopId || !line) return;
    refresh();
    const t = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(t);
  }, [stopId, line, direction, refresh]);

  return { eta, updatedAt, offline };
}
