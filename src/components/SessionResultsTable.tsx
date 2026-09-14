import { ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";
import type { CountEntry, Gender, Segment, Session } from "../types";
import { downloadCsv } from "../utils/csv";
import {
  directionAxisLabel,
  flattenSegmentEntries,
  formatEntryTime,
  mobilityLabel,
  ridingSurfaceLabel,
} from "../utils/entries";
import { formatSegmentTime } from "../utils/segments";

interface SessionResultsTableProps {
  session: Session;
  segments: Segment[];
  segmentEntries: Record<number, CountEntry[]>;
}

type GenderFilter = "all" | Gender;
type DirectionFilter = "all" | "ew" | "ns";
type BoolFilter = "all" | "yes" | "no";
type MobilityFilter = "all" | "bicycle" | "emoto" | "ebike" | "scooter";
type SegmentFilter = "all" | string;

function FilterSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-0.5 text-xs">
      <span className="font-medium text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-900"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function SessionResultsTable({
  session,
  segments,
  segmentEntries,
}: SessionResultsTableProps) {
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [directionFilter, setDirectionFilter] =
    useState<DirectionFilter>("all");
  const [helmetFilter, setHelmetFilter] = useState<BoolFilter>("all");
  const [indegoFilter, setIndegoFilter] = useState<BoolFilter>("all");
  const [mobilityFilter, setMobilityFilter] = useState<MobilityFilter>("all");
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>("all");
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const allEntries = useMemo(
    () => flattenSegmentEntries(segmentEntries, segments),
    [segmentEntries, segments],
  );

  const segmentOptions = useMemo(
    () => [
      { value: "all" as const, label: "All segments" },
      ...segments.map((s) => ({
        value: String(s.index),
        label: `${formatSegmentTime(s.startTime)}–${formatSegmentTime(s.endTime)}`,
      })),
    ],
    [segments],
  );

  const filtered = useMemo(() => {
    return allEntries.filter(({ entry, segmentIndex }) => {
      if (genderFilter !== "all" && entry.gender !== genderFilter) return false;
      if (
        directionFilter === "ew" &&
        entry.direction !== "E" &&
        entry.direction !== "W"
      )
        return false;
      if (
        directionFilter === "ns" &&
        entry.direction !== "N" &&
        entry.direction !== "S"
      )
        return false;
      if (helmetFilter === "yes" && !entry.helmet) return false;
      if (helmetFilter === "no" && entry.helmet) return false;
      if (indegoFilter === "yes" && !entry.indego) return false;
      if (indegoFilter === "no" && entry.indego) return false;
      if (
        mobilityFilter === "bicycle" &&
        (entry.emoto || entry.ebike || entry.scooter)
      )
        return false;
      if (mobilityFilter === "emoto" && !entry.emoto) return false;
      if (mobilityFilter === "ebike" && !entry.ebike) return false;
      if (mobilityFilter === "scooter" && !entry.scooter) return false;
      if (segmentFilter !== "all" && String(segmentIndex) !== segmentFilter)
        return false;
      return true;
    });
  }, [
    allEntries,
    genderFilter,
    directionFilter,
    helmetFilter,
    indegoFilter,
    mobilityFilter,
    segmentFilter,
  ]);

  const activeFilterCount = [
    segmentFilter !== "all",
    genderFilter !== "all",
    directionFilter !== "all",
    helmetFilter !== "all",
    indegoFilter !== "all",
    mobilityFilter !== "all",
  ].filter(Boolean).length;

  const hasEntries = allEntries.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-4 pt-8">
      <h3 className="text-sm font-semibold text-neutral-900">
        Recorded counts ({filtered.length}
        {filtered.length !== allEntries.length
          ? ` of ${allEntries.length}`
          : ""}
        )
      </h3>

      <div className="rounded-lg ring-1 ring-neutral-200">
        <button
          type="button"
          onClick={() => setFiltersExpanded((expanded) => !expanded)}
          aria-expanded={filtersExpanded}
          className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium text-neutral-900 active:bg-neutral-50"
        >
          <span className="flex items-center gap-2">
            Filters
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-bcgp px-2 py-0.5 text-xs font-semibold text-white">
                {activeFilterCount}
              </span>
            )}
          </span>
          {filtersExpanded ? (
            <ChevronUp size={18} className="shrink-0 text-muted" />
          ) : (
            <ChevronDown size={18} className="shrink-0 text-muted" />
          )}
        </button>

        {filtersExpanded && (
          <div className="grid grid-cols-2 gap-2 border-t border-neutral-200 p-3 sm:grid-cols-3">
            <FilterSelect
              label="Segment"
              value={segmentFilter}
              onChange={setSegmentFilter}
              options={segmentOptions}
            />
            <FilterSelect
              label="Gender"
              value={genderFilter}
              onChange={setGenderFilter}
              options={[
                { value: "all", label: "All" },
                { value: "M", label: "Male" },
                { value: "F", label: "Female" },
                { value: "X", label: "Unknown" },
              ]}
            />
            <FilterSelect
              label="Direction"
              value={directionFilter}
              onChange={setDirectionFilter}
              options={[
                { value: "all", label: "All" },
                { value: "ew", label: "East/West" },
                { value: "ns", label: "North/South" },
              ]}
            />
            <FilterSelect
              label="Helmet"
              value={helmetFilter}
              onChange={setHelmetFilter}
              options={[
                { value: "all", label: "All" },
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />
            <FilterSelect
              label="Indego"
              value={indegoFilter}
              onChange={setIndegoFilter}
              options={[
                { value: "all", label: "All" },
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />
            <FilterSelect
              label="Mobility"
              value={mobilityFilter}
              onChange={setMobilityFilter}
              options={[
                { value: "all", label: "All" },
                { value: "bicycle", label: "Bicycle" },
                { value: "emoto", label: "E-Moto" },
                { value: "ebike", label: "E-Bike" },
                { value: "scooter", label: "Scooter" },
              ]}
            />
          </div>
        )}
      </div>

      {!hasEntries ? (
        <p className="py-8 text-center text-sm text-muted">
          No counts recorded.
        </p>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          No counts match these filters.
        </p>
      ) : (
        <div className="-mx-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-xs text-muted">
                <th className="px-3 py-2 font-medium">Time</th>
                <th className="px-3 py-2 font-medium">Segment</th>
                <th className="px-3 py-2 font-medium">Dir</th>
                <th className="px-3 py-2 font-medium">Surface</th>
                <th className="px-3 py-2 font-medium">Gender</th>
                <th className="px-3 py-2 font-medium">Helmet</th>
                <th className="px-3 py-2 font-medium">Indego</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ entry, segmentLabel }) => (
                <tr
                  key={entry.id}
                  className="border-b border-neutral-100 text-neutral-800"
                >
                  <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                    {formatEntryTime(entry.timestamp)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs">
                    {segmentLabel}
                  </td>
                  <td className="px-3 py-2">{directionAxisLabel(entry)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs">
                    {ridingSurfaceLabel(entry.ridingSurface)}
                  </td>
                  <td className="px-3 py-2">{entry.gender}</td>
                  <td className="px-3 py-2">{entry.helmet ? "Y" : ""}</td>
                  <td className="px-3 py-2">{entry.indego ? "Y" : ""}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs">
                    {mobilityLabel(entry)}
                  </td>
                  <td className="max-w-[8rem] truncate px-3 py-2 text-xs">
                    {entry.notes || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasEntries && (
        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={() => downloadCsv(session, segmentEntries, segments)}
            className="w-full rounded-xl bg-neutral-800 py-4 text-lg font-bold text-white active:bg-neutral-700"
          >
            Download CSV
          </button>
        </div>
      )}
    </div>
  );
}
