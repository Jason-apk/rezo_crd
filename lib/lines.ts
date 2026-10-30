import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type Line = { id: string; number: string; name: string };

export async function fetchLines(): Promise<Line[]> {
  // inner join sur line_shapes : une ligne sans tracé n'apparaît pas
  const { data, error } = await supabase
    .from("bus_lines")
    .select("id, line_number, line_name, line_shapes!inner(line_id)")
    .order("line_number");

  if (error) throw error;

  const seen = new Set<string>();
  const lines: Line[] = [];
  for (const l of data ?? []) {
    if (seen.has(l.id)) continue; // dédoublonne : une ligne a 2 lignes (aller+retour) dans le résultat
    seen.add(l.id);
    lines.push({ id: l.id, number: l.line_number, name: l.line_name });
  }
  return lines;
}

export function useLines() {
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLines()
      .then(setLines)
      .catch((e) => console.log("fetchLines erreur :", e))
      .finally(() => setLoading(false));
  }, []);

  return { lines, loading };
}
