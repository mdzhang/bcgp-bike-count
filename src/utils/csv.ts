import type { CountEntry, Segment, Session } from "../types";
import { directionAxisLabel } from "./entries";
import { formatSegmentTime } from "./segments";

const ET_TIMEZONE = "America/New_York";

export function formatCsvTime(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ET_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const lookup = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${lookup.year}-${lookup.month}-${lookup.day} ${lookup.hour}:${lookup.minute} ET`;
}

function entryToRow(entry: CountEntry, segment: Segment): string {
  const fields = [
    formatCsvTime(segment.startTime),
    formatCsvTime(segment.endTime),
    directionAxisLabel(entry),
    entry.ridingSurface,
    entry.gender,
    entry.helmet ? "true" : "false",
    entry.indego ? "true" : "false",
    entry.emoto ? "true" : "false",
    entry.ebike ? "true" : "false",
    entry.scooter ? "true" : "false",
    `"${entry.notes.replace(/"/g, '""')}"`,
  ];
  return fields.join(",");
}

export function generateCsv(
  segmentEntries: Record<number, CountEntry[]>,
  segments: Segment[],
): string {
  const header =
    "start_time,end_time,direction,riding_surface,gender,helmet,indego,emoto,ebike,scooter,notes";
  const rows: string[] = [header];

  const segmentByIndex = new Map(segments.map((s) => [s.index, s]));
  const indices = Object.keys(segmentEntries)
    .map(Number)
    .sort((a, b) => a - b);

  for (const index of indices) {
    const segment = segmentByIndex.get(index);
    if (!segment) continue;

    for (const entry of segmentEntries[index] ?? []) {
      rows.push(entryToRow(entry, segment));
    }
  }

  return rows.join("\n");
}

export function downloadCsv(
  session: Session,
  segmentEntries: Record<number, CountEntry[]>,
  segments: Segment[],
): void {
  const csv = generateCsv(segmentEntries, segments);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const locationSlug = session.location
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase();
  const dateStr = formatSegmentTime(session.startTime).replace(":", "");
  const filename = `bike-count_${locationSlug}_${dateStr}.csv`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
