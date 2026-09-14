import { SEGMENT_DURATION_MS } from "../constants";
import type { Segment, Session } from "../types";

export function isWithinSegmentSchedule(
  segment: Segment,
  session: Session,
  now: Date,
): boolean {
  if (now.toDateString() !== session.startTime.toDateString()) {
    return false;
  }
  return now >= segment.startTime && now < segment.endTime;
}

export function segmentCountdownRemaining(startedAt: Date, now: Date): number {
  return startedAt.getTime() + SEGMENT_DURATION_MS - now.getTime();
}
