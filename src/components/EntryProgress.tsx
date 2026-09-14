import type { CountEntry } from "../types";
import EntryBadge from "./EntryBadge";

interface EntryProgressProps {
  entries: CountEntry[];
  onEdit: (entry: CountEntry) => void;
  readonly?: boolean;
}

export default function EntryProgress({
  entries,
  onEdit,
  readonly = false,
}: EntryProgressProps) {
  if (entries.length === 0) return null;

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-neutral-600">
        Observations so far
      </p>
      <div className="-mx-4 overflow-x-auto">
        <div className="flex min-w-min">
          {entries.map((entry) => (
            <EntryBadge
              key={entry.id}
              entry={entry}
              onClick={readonly ? undefined : () => onEdit(entry)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
