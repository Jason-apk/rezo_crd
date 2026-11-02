import {
    LINE_NAMES,
    STOPS_BY_LINE,
    type Direction,
    type LineNumber,
} from "../data/lines_stops";

export type StopItem = { id: string; name: string; sequence: number };
export type Line = { number: string; name: string };

const DIR_KEY: Record<0 | 1, Direction> = { 0: "aller", 1: "retour" };

export function getAvailableLines(): Line[] {
  return (Object.keys(LINE_NAMES) as LineNumber[]).map((number) => ({
    number,
    name: LINE_NAMES[number],
  }));
}

export function getLineName(line: string): string {
  return LINE_NAMES[line as LineNumber] ?? line;
}

export function getDirectionLabel(line: string, direction: 0 | 1): string {
  const name = LINE_NAMES[line as LineNumber];
  if (!name) return direction === 0 ? "Aller" : "Retour";
  const [origin, destination] = name.split(" - ").map((s) => s.trim());
  return direction === 0 ? `Vers ${destination}` : `Vers ${origin}`;
}

export function getStops(line: string, direction: 0 | 1): StopItem[] {
  const list = STOPS_BY_LINE[line as LineNumber]?.[DIR_KEY[direction]];
  if (!list) return [];
  return list
    .slice()
    .sort((a, b) => a.ordre - b.ordre)
    .map((s) => ({ id: s.id, name: s.nom, sequence: s.ordre }));
}
