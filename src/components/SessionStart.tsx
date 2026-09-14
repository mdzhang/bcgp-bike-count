import { filter } from "lodash";
import { useId, useRef, useState } from "react";
import {
  LOCATIONS,
  type Location,
  SESSION_PERIODS,
  type SessionPeriodId,
} from "../constants";
import type { Session } from "../types";
import {
  defaultSessionPeriod,
  formatDateInput,
  parseDateInput,
  sessionTimesForPeriod,
} from "../utils/sessionPeriod";

interface SessionStartProps {
  onStart: (session: Session) => void;
}

export default function SessionStart({ onStart }: SessionStartProps) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const now = new Date();

  const [locationQuery, setLocationQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sessionDateStr, setSessionDateStr] = useState(() =>
    formatDateInput(now),
  );
  const [periodId, setPeriodId] = useState<SessionPeriodId>(() =>
    defaultSessionPeriod(now),
  );
  const [error, setError] = useState<string | null>(null);

  const suggestions = locationQuery
    ? filter(LOCATIONS, (loc) =>
        loc.toLowerCase().includes(locationQuery.toLowerCase()),
      )
    : [...LOCATIONS];

  const handleSelectLocation = (loc: Location) => {
    setSelectedLocation(loc);
    setLocationQuery(loc);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedLocation) {
      setError("Please select a location from the list.");
      return;
    }

    const sessionDate = parseDateInput(sessionDateStr);
    if (!sessionDate) {
      setError("Please select a valid session date.");
      return;
    }

    const { startTime, endTime } = sessionTimesForPeriod(periodId, sessionDate);
    onStart({ location: selectedLocation, startTime, endTime });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-6"
    >
      <h2 className="text-lg font-semibold text-neutral-900">New session</h2>

      <div className="relative">
        <label htmlFor="location" className="mb-1 block text-sm font-medium">
          Location
        </label>
        <input
          ref={inputRef}
          id="location"
          type="text"
          autoComplete="off"
          placeholder="Search locations…"
          value={locationQuery}
          onChange={(e) => {
            setLocationQuery(e.target.value);
            setSelectedLocation(null);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-base focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div
            id={listId}
            className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-neutral-200 bg-white shadow-lg"
          >
            {suggestions.map((loc) => (
              <button
                key={loc}
                type="button"
                onMouseDown={() => handleSelectLocation(loc)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 active:bg-neutral-200 ${
                  loc === selectedLocation
                    ? "bg-neutral-100 font-medium text-bcgp"
                    : ""
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="session-date"
          className="mb-1 block text-sm font-medium"
        >
          Session date
        </label>
        <input
          id="session-date"
          type="date"
          value={sessionDateStr}
          onChange={(e) => setSessionDateStr(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-base focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
        />
      </div>

      <fieldset>
        <legend className="mb-2 block text-sm font-medium">Session time</legend>
        <div className="flex flex-col gap-2">
          {SESSION_PERIODS.map((period) => {
            const selected = periodId === period.id;
            return (
              <button
                key={period.id}
                type="button"
                onClick={() => setPeriodId(period.id)}
                className={`rounded-xl px-4 py-3 text-left transition-colors ${
                  selected
                    ? "bg-bcgp text-white"
                    : "bg-white text-neutral-700 ring-1 ring-neutral-200 active:bg-neutral-50"
                }`}
              >
                <span className="block font-medium">{period.display}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="rounded-lg bg-neutral-800 px-4 py-3 text-base font-semibold text-white active:bg-neutral-700"
      >
        Start Session
      </button>
    </form>
  );
}
