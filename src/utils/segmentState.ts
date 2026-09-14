export type SegmentState =
  | { status: "idle" }
  | { status: "running"; startedAt: Date }
  | { status: "ended"; startedAt: Date; frozenRemainingMs: number };

export type SegmentStates = Record<number, SegmentState>;

export function getSegmentState(
  states: SegmentStates,
  index: number,
): SegmentState {
  return states[index] ?? { status: "idle" };
}

export function isSegmentStarted(state: SegmentState): boolean {
  return state.status !== "idle";
}

export function isSegmentEnded(state: SegmentState): boolean {
  return state.status === "ended";
}

export function segmentStartedAt(state: SegmentState): Date | null {
  return state.status === "idle" ? null : state.startedAt;
}

export function segmentFrozenRemaining(
  state: SegmentState,
): number | undefined {
  return state.status === "ended" ? state.frozenRemainingMs : undefined;
}

export function segmentStatesFromPersisted(
  startedSegments: number[],
  endedSegments: number[],
  segmentStartTimes: Record<number, Date>,
  segmentFrozenRemaining: Record<number, number>,
): SegmentStates {
  const states: SegmentStates = {};

  for (const index of startedSegments) {
    const startedAt = segmentStartTimes[index];
    if (!startedAt) continue;

    states[index] = endedSegments.includes(index)
      ? {
          status: "ended",
          startedAt,
          frozenRemainingMs: segmentFrozenRemaining[index] ?? 0,
        }
      : { status: "running", startedAt };
  }

  return states;
}

export function segmentStatesToPersisted(states: SegmentStates): {
  startedSegments: number[];
  endedSegments: number[];
  segmentStartTimes: Record<number, Date>;
  segmentFrozenRemaining: Record<number, number>;
} {
  const startedSegments: number[] = [];
  const endedSegments: number[] = [];
  const segmentStartTimes: Record<number, Date> = {};
  const segmentFrozenRemaining: Record<number, number> = {};

  for (const [indexStr, state] of Object.entries(states)) {
    if (state.status === "idle") continue;

    const index = Number(indexStr);
    startedSegments.push(index);
    segmentStartTimes[index] = state.startedAt;

    if (state.status === "ended") {
      endedSegments.push(index);
      segmentFrozenRemaining[index] = state.frozenRemainingMs;
    }
  }

  startedSegments.sort((a, b) => a - b);
  endedSegments.sort((a, b) => a - b);

  return {
    startedSegments,
    endedSegments,
    segmentStartTimes,
    segmentFrozenRemaining,
  };
}
