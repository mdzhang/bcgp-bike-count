import type { CountEntry, CountFormState, Segment, Session } from "../types";
import { formToEntry } from "../utils/entries";
import { createSegments } from "../utils/segments";
import { sessionTimesForPeriod } from "../utils/sessionPeriod";

export const TEST_SESSION_DATE = new Date(2026, 8, 14);

export function createTestSession(): Session {
  const { startTime, endTime } = sessionTimesForPeriod("am", TEST_SESSION_DATE);

  return {
    location: "Walnut St. Bridge",
    startTime,
    endTime,
  };
}

export function createTestSegments(session = createTestSession()): Segment[] {
  return createSegments(session);
}

export function entryFromForm(
  form: CountFormState,
  overrides: Partial<CountEntry> = {},
): CountEntry {
  return {
    ...formToEntry(form),
    id: overrides.id ?? crypto.randomUUID(),
    timestamp: overrides.timestamp ?? new Date("2026-09-14T12:00:00.000Z"),
    ...overrides,
  };
}

export const OBSERVATION_COMBOS: Array<{
  name: string;
  form: CountFormState;
  expectedRow: Omit<CountEntry, "id" | "timestamp" | "direction"> & {
    direction: string;
    notes: string;
  };
}> = [
  {
    name: "default east/west male",
    form: {
      directionAxis: "ew",
      direction: "E",
      ridingSurface: "on_street",
      gender: "M",
      helmet: false,
      indego: false,
      mobilityType: null,
      notes: "",
    },
    expectedRow: {
      direction: "east/west",
      ridingSurface: "on_street",
      gender: "M",
      helmet: false,
      indego: false,
      emoto: false,
      ebike: false,
      scooter: false,
      notes: "",
    },
  },
  {
    name: "north/south female with helmet and indego",
    form: {
      directionAxis: "ns",
      direction: "N",
      ridingSurface: "sidewalk",
      gender: "F",
      helmet: true,
      indego: true,
      mobilityType: null,
      notes: "",
    },
    expectedRow: {
      direction: "north/south",
      ridingSurface: "sidewalk",
      gender: "F",
      helmet: true,
      indego: true,
      emoto: false,
      ebike: false,
      scooter: false,
      notes: "",
    },
  },
  {
    name: "unknown rider on e-moto with notes",
    form: {
      directionAxis: "ew",
      direction: "W",
      ridingSurface: "against_traffic",
      gender: "X",
      helmet: false,
      indego: false,
      mobilityType: "emoto",
      notes: 'Said "hello"',
    },
    expectedRow: {
      direction: "east/west",
      ridingSurface: "against_traffic",
      gender: "X",
      helmet: false,
      indego: false,
      emoto: true,
      ebike: false,
      scooter: false,
      notes: 'Said "hello"',
    },
  },
  {
    name: "e-bike with notes",
    form: {
      directionAxis: "ns",
      direction: "S",
      ridingSurface: "on_street",
      gender: "M",
      helmet: true,
      indego: false,
      mobilityType: "ebike",
      notes: "test note",
    },
    expectedRow: {
      direction: "north/south",
      ridingSurface: "on_street",
      gender: "M",
      helmet: true,
      indego: false,
      emoto: false,
      ebike: true,
      scooter: false,
      notes: "test note",
    },
  },
  {
    name: "scooter rider",
    form: {
      directionAxis: "ew",
      direction: "E",
      ridingSurface: "on_street",
      gender: "F",
      helmet: false,
      indego: false,
      mobilityType: "scooter",
      notes: "",
    },
    expectedRow: {
      direction: "east/west",
      ridingSurface: "on_street",
      gender: "F",
      helmet: false,
      indego: false,
      emoto: false,
      ebike: false,
      scooter: true,
      notes: "",
    },
  },
];

export const UI_OBSERVATION_COMBOS = OBSERVATION_COMBOS.filter(
  (combo) => !combo.form.notes,
);
