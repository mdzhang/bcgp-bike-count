export const BCGP_URL = "https://bicyclecoalition.org/";
export const BCGP_NAME = "Bicycle Coalition of Greater Philadelphia";

export const LOCATIONS = [
  "Walnut St. Bridge",
  "South St. Bridge",
  "Chestnut St. Bridge",
  "Market St. Bridge",
  "Spring Garden St. Bridge",
  "JFK Blvd",
  "10th and Pine",
  "13th and Spruce",
  "11th and Washington",
  "Broad and Pine",
  "22nd and Spruce",
  "21st and Pine",
  "38th and Spruce",
  "5th and Spring Garden",
  "Ben Franklin Bridge",
  "13th and CB Moore",
  "22nd and Fairmount",
  "44th and Walnut",
  "20th and Market",
  "13th and Washington",
  "13th and Snyder",
] as const;

export type Location = (typeof LOCATIONS)[number];

export const SEGMENT_DURATION_MS = 15 * 60 * 1000;

export const SESSION_PERIODS = [
  {
    id: "am",
    label: "AM",
    display: "7:30 – 9:00 AM",
    startHour: 7,
    startMinute: 30,
    endHour: 9,
    endMinute: 0,
  },
  {
    id: "pm",
    label: "PM",
    display: "4:30 – 6:00 PM",
    startHour: 16,
    startMinute: 30,
    endHour: 18,
    endMinute: 0,
  },
] as const;

export type SessionPeriodId = (typeof SESSION_PERIODS)[number]["id"];
