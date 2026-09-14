import { ChevronRight, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import type { Segment, Session } from "../types";
import {
  isWithinSegmentSchedule,
  segmentCountdownRemaining,
} from "../utils/session";

interface SegmentStartPromptProps {
  sessionEnded: boolean;
  onStart: () => void;
}

interface SegmentTimerBarProps {
  startedAt: Date;
  frozenRemainingMs?: number;
  sessionEnded?: boolean;
  frozenClockAt?: Date;
  showEndSegment: boolean;
  onEndSegment: () => void;
  showNext?: boolean;
  onNext?: () => void;
  onUnendSegment?: () => void;
}

function formatClock(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function SegmentTimerBar({
  startedAt,
  frozenRemainingMs,
  sessionEnded = false,
  frozenClockAt,
  showEndSegment,
  onEndSegment,
  showNext = false,
  onNext,
  onUnendSegment,
}: SegmentTimerBarProps) {
  const [now, setNow] = useState(() => new Date());
  const isRemainingFrozen = frozenRemainingMs !== undefined;

  useEffect(() => {
    if (sessionEnded) return;
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [sessionEnded]);

  const displayTime = sessionEnded && frozenClockAt ? frozenClockAt : now;
  const remaining = isRemainingFrozen
    ? frozenRemainingMs
    : segmentCountdownRemaining(startedAt, now);
  const isExpired = remaining <= 0;

  return (
    <div className="mt-3 border-t border-neutral-200 pt-3">
      <div className="flex items-center justify-center gap-4">
        <div className="text-center">
          <p className="text-xs text-muted">
            {sessionEnded ? "Session ended" : "Now"}
          </p>
          <p className="text-2xl font-bold tabular-nums text-neutral-900">
            {formatClock(displayTime)}
          </p>
        </div>
        {!sessionEnded && (
          <div className="text-center">
            <p className="text-xs text-muted">Remaining</p>
            <p
              className={`text-2xl font-semibold tabular-nums ${
                isExpired ? "text-red-600" : "text-neutral-700"
              }`}
            >
              {isExpired ? "0:00" : formatCountdown(remaining)}
            </p>
          </div>
        )}
        {showEndSegment && (
          <button
            type="button"
            onClick={onEndSegment}
            className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-red-600 ring-1 ring-red-200 active:bg-red-50"
          >
            End Segment
          </button>
        )}
        {showNext && onNext && onUnendSegment && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onUnendSegment}
              aria-label="Resume segment"
              className="rounded-lg p-2 text-neutral-700 ring-1 ring-neutral-200 active:bg-neutral-50"
            >
              <Unlock size={20} />
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Next segment"
              className="rounded-lg bg-neutral-800 p-2 text-white active:bg-neutral-700"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface ScheduleWarningBannerProps {
  segment: Segment;
  session: Session;
}

export function ScheduleWarningBanner({
  segment,
  session,
}: ScheduleWarningBannerProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (isWithinSegmentSchedule(segment, session, now)) return null;

  return (
    <div
      className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
      role="alert"
    >
      <p className="font-medium">⚠️ Outside scheduled time</p>
      <p className="mt-1 text-amber-800">
        It&apos;s not the scheduled date/time for this segment. You can still
        start counting, or wait until the warning clears.
      </p>
    </div>
  );
}

export function SegmentStartPrompt({
  sessionEnded,
  onStart,
}: SegmentStartPromptProps) {
  if (sessionEnded) return null;

  return (
    <div className="mt-auto w-full pt-4">
      <button
        type="button"
        onClick={onStart}
        className="w-full rounded-xl bg-neutral-800 py-4 text-lg font-bold text-white active:bg-neutral-700"
      >
        Start Segment
      </button>
    </div>
  );
}
