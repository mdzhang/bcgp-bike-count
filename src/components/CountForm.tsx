import {
  ChevronDown,
  ChevronUp,
  HardHat,
  MapPin,
  MessageSquare,
  Zap,
} from "lucide-react";
import { useState } from "react";
import {
  type CountFormState,
  DEFAULT_FORM_STATE,
  type Gender,
  type MobilityType,
  type RidingSurface,
} from "../types";

interface CountFormProps {
  value: CountFormState;
  onChange: (state: CountFormState) => void;
}

function SegmentedGroup({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex divide-x divide-neutral-200 overflow-hidden rounded-xl ring-1 ring-neutral-200 ${className}`}
    >
      {children}
    </div>
  );
}

function ToggleButton({
  selected,
  onClick,
  children,
  className = "",
  segmented = false,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  segmented?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-medium transition-colors ${
        segmented
          ? `flex-1 px-4 py-3 ${
              selected
                ? "bg-bcgp text-white"
                : "bg-white text-neutral-700 active:bg-neutral-50"
            }`
          : `rounded-xl px-4 py-3 ${
              selected
                ? "bg-bcgp text-white"
                : "bg-white text-neutral-700 ring-1 ring-neutral-200 active:bg-neutral-50"
            }`
      } ${className}`}
    >
      {children}
    </button>
  );
}

function IconOption({
  selected,
  onClick,
  icon,
  label,
  compact = false,
  segmented = false,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  compact?: boolean;
  segmented?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 transition-colors ${
        compact
          ? "flex-row items-center justify-center gap-1.5 px-2 py-2"
          : segmented
            ? "flex-col items-center gap-1 py-3"
            : "flex-col items-center gap-1 rounded-xl py-3"
      } ${
        segmented || compact
          ? selected
            ? "bg-bcgp text-white"
            : "bg-white text-neutral-700 active:bg-neutral-50"
          : selected
            ? "bg-bcgp text-white"
            : "bg-white text-neutral-700 ring-1 ring-neutral-200 active:bg-neutral-50"
      }`}
    >
      <span
        className={`shrink-0 ${compact ? "text-base leading-none" : "text-xl"}`}
      >
        {icon}
      </span>
      <span
        className={`font-medium leading-tight ${
          compact ? "text-[10px]" : "text-xs"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

export default function CountForm({ value, onChange }: CountFormProps) {
  const [notesExpanded, setNotesExpanded] = useState(false);

  const update = (partial: Partial<CountFormState>) => {
    onChange({ ...value, ...partial });
  };

  const handleEastWest = () => {
    if (value.directionAxis === "ew") {
      update({ direction: value.direction === "E" ? "W" : "E" });
    } else {
      update({ directionAxis: "ew", direction: "E" });
    }
  };

  const handleNorthSouth = () => {
    if (value.directionAxis === "ns") {
      update({ direction: value.direction === "N" ? "S" : "N" });
    } else {
      update({ directionAxis: "ns", direction: "N" });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="pt-4">
        <SegmentedGroup>
          <ToggleButton
            segmented
            selected={value.directionAxis === "ew"}
            onClick={handleEastWest}
          >
            East/West
          </ToggleButton>
          <ToggleButton
            segmented
            selected={value.directionAxis === "ns"}
            onClick={handleNorthSouth}
          >
            North/South
          </ToggleButton>
        </SegmentedGroup>
      </div>

      <SegmentedGroup>
        <ToggleButton
          segmented
          selected={value.ridingSurface === "on_street"}
          onClick={() =>
            update({ ridingSurface: "on_street" as RidingSurface })
          }
          className="flex-[1.6] py-3 text-sm"
        >
          On Street
        </ToggleButton>
        <ToggleButton
          segmented
          selected={value.ridingSurface === "sidewalk"}
          onClick={() => update({ ridingSurface: "sidewalk" as RidingSurface })}
          className="flex-1 px-2 py-2 text-[10px] leading-tight"
        >
          Sidewalk
        </ToggleButton>
        <ToggleButton
          segmented
          selected={value.ridingSurface === "against_traffic"}
          onClick={() =>
            update({ ridingSurface: "against_traffic" as RidingSurface })
          }
          className="flex-1 px-1.5 py-2 text-[9px] leading-tight"
        >
          Against Traffic
        </ToggleButton>
      </SegmentedGroup>

      <div className="flex gap-2">
        <ToggleButton
          selected={value.helmet}
          onClick={() => update({ helmet: !value.helmet })}
          className="flex flex-1 items-center justify-center gap-2"
        >
          <HardHat size={22} />
          <span>Helmet</span>
        </ToggleButton>
        <ToggleButton
          selected={value.indego}
          onClick={() => update({ indego: !value.indego })}
          className="flex flex-1 items-center justify-center gap-2"
        >
          <MapPin size={22} />
          <span>Indego</span>
        </ToggleButton>
      </div>

      <SegmentedGroup>
        <IconOption
          segmented
          selected={value.gender === "M"}
          onClick={() => update({ gender: "M" as Gender })}
          icon="♂"
          label="Male"
        />
        <IconOption
          segmented
          selected={value.gender === "X"}
          onClick={() => update({ gender: "X" as Gender })}
          icon="?"
          label="Unknown"
        />
        <IconOption
          segmented
          selected={value.gender === "F"}
          onClick={() => update({ gender: "F" as Gender })}
          icon="♀"
          label="Female"
        />
      </SegmentedGroup>

      <SegmentedGroup>
        {(
          [
            {
              type: "emoto" as MobilityType,
              label: "E-Moto",
              icon: "🏍️",
            },
            {
              type: "ebike" as MobilityType,
              label: "E-Bike",
              icon: <Zap size={14} />,
            },
            { type: "scooter" as MobilityType, label: "Scooter", icon: "🛴" },
          ] as const
        ).map(({ type, label, icon }) => (
          <IconOption
            key={type}
            compact
            segmented
            selected={value.mobilityType === type}
            onClick={() =>
              update({
                mobilityType: value.mobilityType === type ? null : type,
              })
            }
            icon={icon}
            label={label}
          />
        ))}
      </SegmentedGroup>

      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => setNotesExpanded((v) => !v)}
          className="flex items-center gap-2 text-sm text-muted"
        >
          <MessageSquare size={16} />
          <span>Add note</span>
          {notesExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {notesExpanded && (
          <textarea
            value={value.notes}
            onChange={(e) => update({ notes: e.target.value })}
            placeholder="Optional notes…"
            rows={3}
            className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
          />
        )}
      </div>
    </div>
  );
}

export { DEFAULT_FORM_STATE };
