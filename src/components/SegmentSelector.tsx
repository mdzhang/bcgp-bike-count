import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { Segment } from "../types";
import { formatSegmentTime } from "../utils/segments";

const SWIPE_THRESHOLD_PX = 50;

interface SegmentSelectorProps {
  segments: Segment[];
  activeIndex: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
  blockNext?: boolean;
}

export default function SegmentSelector({
  segments,
  activeIndex,
  onSelect,
  disabled = false,
  blockNext = false,
}: SegmentSelectorProps) {
  const touchStartX = useRef<number | null>(null);
  const activeSegment = segments[activeIndex];
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < segments.length - 1 && !blockNext;

  const goPrev = () => {
    if (canGoPrev && !disabled) onSelect(activeIndex - 1);
  };

  const goNext = () => {
    if (canGoNext && !disabled) onSelect(activeIndex + 1);
  };

  const handleSelect = (index: number) => {
    if (disabled) return;
    if (index > activeIndex && blockNext) return;
    onSelect(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || disabled) return;

    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > SWIPE_THRESHOLD_PX) goPrev();
    else if (deltaX < -SWIPE_THRESHOLD_PX) goNext();

    touchStartX.current = null;
  };

  if (!activeSegment) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="flex w-full touch-pan-y items-center gap-1"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev || disabled}
          aria-label="Previous segment"
          className="rounded-lg p-2 text-neutral-700 disabled:text-neutral-300 active:bg-neutral-100"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="min-w-0 flex-1 text-center select-none">
          <p className="text-sm font-semibold text-neutral-900">
            {formatSegmentTime(activeSegment.startTime)}–
            {formatSegmentTime(activeSegment.endTime)}
          </p>
          <p className="text-xs text-muted">
            Segment {activeIndex + 1} of {segments.length}
          </p>
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext || disabled}
          aria-label="Next segment"
          className="rounded-lg p-2 text-neutral-700 disabled:text-neutral-300 active:bg-neutral-100"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      <div
        className="flex items-center gap-2"
        role="tablist"
        aria-label="Session segments"
      >
        {segments.map((segment) => {
          const isActive = segment.index === activeIndex;
          const isForward = segment.index > activeIndex;
          const isDotDisabled =
            disabled || (blockNext && isForward && !isActive);

          return (
            <button
              key={segment.index}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Segment ${segment.index + 1}, ${formatSegmentTime(segment.startTime)} to ${formatSegmentTime(segment.endTime)}`}
              disabled={isDotDisabled}
              onClick={() => handleSelect(segment.index)}
              className={`rounded-full transition-all ${
                isActive
                  ? "h-2.5 w-2.5 bg-bcgp"
                  : isDotDisabled
                    ? "h-2 w-2 bg-neutral-200"
                    : "h-2 w-2 bg-neutral-300 active:bg-neutral-400"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
