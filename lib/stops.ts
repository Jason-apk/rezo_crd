import {
  LINE_NAMES,
  STOPS_BY_LINE,
  type LineNumber,
} from "../data/lines_stops";

export type StopItem = { id: string; name: string; sequence: number };
export type Line = { number: string; name: string };

export function getAvailableLines(): Line[] {
  return (Object.keys(LINE_NAMES) as LineNumber[]).map((number) => ({
    number,
    name: LINE_NAMES[number],
  }));
}

export function getLineName(line: string): string {
  return LINE_NAMES[line as LineNumber] ?? line;
}

export function getStops(line: string): StopItem[] {
  const list = STOPS_BY_LINE[line as LineNumber]?.aller;
  if (!list) return [];
  return list
    .slice()
    .sort((a, b) => a.ordre - b.ordre)
    .map((s) => ({ id: s.id, name: s.nom, sequence: s.ordre }));
}
