import { LOCATIONS, type Location } from "../constants";
import {
  type CountEntry,
  type CountFormState,
  DEFAULT_FORM_STATE,
  type Session,
} from "../types";
import {
  type SegmentStates,
  segmentStatesFromPersisted,
  segmentStatesToPersisted,
} from "./segmentState";

const STORAGE_KEY = "bcgp-bike-count-session";
const STORAGE_VERSION = 1;

interface StoredCountEntry {
  id: string;
  timestamp: string;
  direction: CountEntry["direction"];
  ridingSurface?: CountEntry["ridingSurface"];
  gender: CountEntry["gender"];
  helmet: boolean;
  indego: boolean;
  emoto: boolean;
  ebike: boolean;
  scooter: boolean;
  notes: string;
}

interface StoredAppState {
  version: typeof STORAGE_VERSION;
  session: {
    location: string;
    startTime: string;
    endTime: string;
  };
  activeSegmentIndex: number;
  startedSegments: number[];
  endedSegments: number[];
  segmentStartTimes: Record<string, string>;
  segmentFrozenRemaining: Record<string, number>;
  segmentEntries: Record<string, StoredCountEntry[]>;
  formState: CountFormState;
  sessionEnded: boolean;
  sessionEndedAt: string | null;
}

export interface PersistedCountState {
  activeSegmentIndex: number;
  segmentStates: SegmentStates;
  segmentEntries: Record<number, CountEntry[]>;
  formState: CountFormState;
  sessionEnded: boolean;
  sessionEndedAt: Date | null;
}

export interface PersistedAppState extends PersistedCountState {
  session: Session;
}

function isLocation(value: string): value is Location {
  return (LOCATIONS as readonly string[]).includes(value);
}

function parseDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function serializeEntry(entry: CountEntry): StoredCountEntry {
  return {
    ...entry,
    timestamp: entry.timestamp.toISOString(),
  };
}

function deserializeEntry(entry: StoredCountEntry): CountEntry | null {
  const timestamp = parseDate(entry.timestamp);
  if (!timestamp) return null;

  return {
    ...entry,
    timestamp,
    ridingSurface: entry.ridingSurface ?? "on_street",
  };
}

function serializeAppState(state: PersistedAppState): StoredAppState {
  const {
    startedSegments,
    endedSegments,
    segmentStartTimes,
    segmentFrozenRemaining,
  } = segmentStatesToPersisted(state.segmentStates);

  const serializedStartTimes = Object.fromEntries(
    Object.entries(segmentStartTimes).map(([index, date]) => [
      index,
      date.toISOString(),
    ]),
  );

  const segmentEntries = Object.fromEntries(
    Object.entries(state.segmentEntries).map(([index, entries]) => [
      index,
      entries.map(serializeEntry),
    ]),
  );

  return {
    version: STORAGE_VERSION,
    session: {
      location: state.session.location,
      startTime: state.session.startTime.toISOString(),
      endTime: state.session.endTime.toISOString(),
    },
    activeSegmentIndex: state.activeSegmentIndex,
    startedSegments,
    endedSegments,
    segmentStartTimes: serializedStartTimes,
    segmentFrozenRemaining,
    segmentEntries,
    formState: state.formState,
    sessionEnded: state.sessionEnded,
    sessionEndedAt: state.sessionEndedAt?.toISOString() ?? null,
  };
}

function deserializeAppState(stored: StoredAppState): PersistedAppState | null {
  if (stored.version !== STORAGE_VERSION) return null;
  if (!isLocation(stored.session.location)) return null;

  const startTime = parseDate(stored.session.startTime);
  const endTime = parseDate(stored.session.endTime);
  if (!startTime || !endTime) return null;

  const segmentStartTimes: Record<number, Date> = {};
  for (const [index, value] of Object.entries(stored.segmentStartTimes)) {
    const date = parseDate(value);
    if (!date) return null;
    segmentStartTimes[Number(index)] = date;
  }

  const segmentEntries: Record<number, CountEntry[]> = {};
  for (const [index, entries] of Object.entries(stored.segmentEntries)) {
    const parsedEntries: CountEntry[] = [];
    for (const entry of entries) {
      const parsed = deserializeEntry(entry);
      if (!parsed) return null;
      parsedEntries.push(parsed);
    }
    segmentEntries[Number(index)] = parsedEntries;
  }

  const sessionEndedAt = stored.sessionEndedAt
    ? parseDate(stored.sessionEndedAt)
    : null;
  if (stored.sessionEndedAt && !sessionEndedAt) return null;

  return {
    session: {
      location: stored.session.location,
      startTime,
      endTime,
    },
    activeSegmentIndex: stored.activeSegmentIndex,
    segmentStates: segmentStatesFromPersisted(
      stored.startedSegments,
      stored.endedSegments,
      segmentStartTimes,
      stored.segmentFrozenRemaining,
    ),
    segmentEntries,
    formState: { ...DEFAULT_FORM_STATE, ...stored.formState },
    sessionEnded: stored.sessionEnded,
    sessionEndedAt,
  };
}

export function createFreshAppState(session: Session): PersistedAppState {
  return {
    session,
    activeSegmentIndex: 0,
    segmentStates: {},
    segmentEntries: {},
    formState: DEFAULT_FORM_STATE,
    sessionEnded: false,
    sessionEndedAt: null,
  };
}

export function loadPersistedAppState(): PersistedAppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const stored = JSON.parse(raw) as StoredAppState;
    return deserializeAppState(stored);
  } catch {
    return null;
  }
}

export function savePersistedAppState(state: PersistedAppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeAppState(state)));
  } catch {
    // Ignore quota or storage errors.
  }
}

export function clearPersistedAppState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}
