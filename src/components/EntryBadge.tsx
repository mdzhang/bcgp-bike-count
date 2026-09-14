import type { CountEntry } from "../types";

interface EntryBadgeProps {
  entry: CountEntry;
  onClick?: () => void;
}

function EntryBadgeContent({ entry }: { entry: CountEntry }) {
  const hasMobility = entry.emoto || entry.ebike || entry.scooter;

  return (
    <>
      <span
        className={`relative flex h-7 w-7 items-center justify-center text-xs font-bold ${
          entry.indego ? "rounded-full ring-2 ring-bcgp" : ""
        }`}
      >
        {entry.helmet && (
          <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[8px] leading-none text-neutral-600">
            ^
          </span>
        )}
        {entry.gender}
      </span>
      {hasMobility && (
        <span className="text-[10px] leading-none text-neutral-500">*</span>
      )}
    </>
  );
}

export default function EntryBadge({ entry, onClick }: EntryBadgeProps) {
  const className = "relative flex flex-col items-center px-0 py-0.5";

  if (!onClick) {
    return (
      <span className={className}>
        <EntryBadgeContent entry={entry} />
      </span>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      <EntryBadgeContent entry={entry} />
    </button>
  );
}
