import { SESSION_PERIODS, type SessionPeriodId } from "../constants";

export function getSessionPeriod(id: SessionPeriodId) {
  const period = SESSION_PERIODS.find((p) => p.id === id);
  if (!period) throw new Error(`Unknown session period: ${id}`);
  return period;
}

export function sessionTimesForPeriod(
  id: SessionPeriodId,
  referenceDate: Date,
): { startTime: Date; endTime: Date } {
  const period = getSessionPeriod(id);
  const startTime = new Date(referenceDate);
  startTime.setHours(period.startHour, period.startMinute, 0, 0);
  const endTime = new Date(referenceDate);
  endTime.setHours(period.endHour, period.endMinute, 0, 0);
  return { startTime, endTime };
}

export function defaultSessionPeriod(referenceDate: Date): SessionPeriodId {
  return referenceDate.getHours() >= 12 ? "pm" : "am";
}

export function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateInput(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}
