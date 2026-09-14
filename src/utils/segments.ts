import { SEGMENT_DURATION_MS } from "../constants";
import type { Segment, Session } from "../types";

export function createSegments(session: Session): Segment[] {
  const segments: Segment[] = [];
  let index = 0;
  let current = session.startTime.getTime();
  const end = session.endTime.getTime();

  while (current < end) {
    const segmentEnd = Math.min(current + SEGMENT_DURATION_MS, end);
    segments.push({
      index,
      startTime: new Date(current),
      endTime: new Date(segmentEnd),
    });
    current = segmentEnd;
    index++;
  }

  return segments;
}

export function formatSegmentTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const h12 = hours % 12 || 12;
  const meridiem = hours < 12 ? "a" : "p";
  return `${h12}:${minutes.toString().padStart(2, "0")}${meridiem}`;
}
