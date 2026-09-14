import type { CountEntry, CountFormState, Segment } from "../types";
import { formatSegmentTime } from "./segments";

export interface FlatEntry {
  entry: CountEntry;
  segmentIndex: number;
  segmentLabel: string;
}

export function flattenSegmentEntries(
  segmentEntries: Record<number, CountEntry[]>,
  segments: Segment[],
): FlatEntry[] {
  const result: FlatEntry[] = [];

  for (const segment of segments) {
    const label = `${formatSegmentTime(segment.startTime)}–${formatSegmentTime(segment.endTime)}`;
    for (const entry of segmentEntries[segment.index] ?? []) {
      result.push({ entry, segmentIndex: segment.index, segmentLabel: label });
    }
  }

  return result.sort(
    (a, b) => a.entry.timestamp.getTime() - b.entry.timestamp.getTime(),
  );
}

export function formToEntry(form: CountFormState): CountEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    direction: form.direction,
    ridingSurface: form.ridingSurface,
    gender: form.gender,
    helmet: form.helmet,
    indego: form.indego,
    emoto: form.mobilityType === "emoto",
    ebike: form.mobilityType === "ebike",
    scooter: form.mobilityType === "scooter",
    notes: form.notes,
  };
}

export function entryToForm(entry: CountEntry): CountFormState {
  let mobilityType: CountFormState["mobilityType"] = null;
  if (entry.emoto) mobilityType = "emoto";
  else if (entry.ebike) mobilityType = "ebike";
  else if (entry.scooter) mobilityType = "scooter";

  const directionAxis =
    entry.direction === "E" || entry.direction === "W" ? "ew" : "ns";

  return {
    directionAxis,
    direction: entry.direction,
    ridingSurface: entry.ridingSurface,
    gender: entry.gender,
    helmet: entry.helmet,
    indego: entry.indego,
    mobilityType,
    notes: entry.notes,
  };
}

export function mobilityLabel(entry: CountEntry): string {
  if (entry.emoto) return "E-Moto";
  if (entry.ebike) return "E-Bike";
  if (entry.scooter) return "Scooter";
  return "—";
}

export function formatEntryTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function directionAxisLabel(entry: CountEntry): string {
  return entry.direction === "E" || entry.direction === "W"
    ? "east/west"
    : "north/south";
}

export function ridingSurfaceLabel(
  ridingSurface: CountEntry["ridingSurface"],
): string {
  switch (ridingSurface) {
    case "on_street":
      return "On street";
    case "sidewalk":
      return "Sidewalk";
    case "against_traffic":
      return "Against traffic";
  }
}
