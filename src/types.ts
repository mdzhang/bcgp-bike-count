import type { Location } from "./constants";

export interface Session {
  location: Location;
  startTime: Date;
  endTime: Date;
}

export interface Segment {
  index: number;
  startTime: Date;
  endTime: Date;
}

export type Direction = "E" | "W" | "N" | "S";
export type DirectionAxis = "ew" | "ns";
export type Gender = "M" | "F" | "X";
export type MobilityType = "emoto" | "ebike" | "scooter";
export type RidingSurface = "on_street" | "sidewalk" | "against_traffic";

export interface CountEntry {
  id: string;
  timestamp: Date;
  direction: Direction;
  ridingSurface: RidingSurface;
  gender: Gender;
  helmet: boolean;
  indego: boolean;
  emoto: boolean;
  ebike: boolean;
  scooter: boolean;
  notes: string;
}

export interface CountFormState {
  directionAxis: DirectionAxis;
  direction: Direction;
  ridingSurface: RidingSurface;
  gender: Gender;
  helmet: boolean;
  indego: boolean;
  mobilityType: MobilityType | null;
  notes: string;
}

export const DEFAULT_FORM_STATE: CountFormState = {
  directionAxis: "ew",
  direction: "E",
  ridingSurface: "on_street",
  gender: "M",
  helmet: false,
  indego: false,
  mobilityType: null,
  notes: "",
};
