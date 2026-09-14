import { Info } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  type CountEntry,
  type CountFormState,
  DEFAULT_FORM_STATE,
  type Session,
} from "../types";
import { entryToForm, formToEntry } from "../utils/entries";
import type { PersistedCountState } from "../utils/persistedSession";
import {
  getSegmentState,
  isSegmentEnded,
  isSegmentStarted,
  segmentFrozenRemaining,
  segmentStartedAt,
} from "../utils/segmentState";
import { createSegments } from "../utils/segments";
import { segmentCountdownRemaining } from "../utils/session";
import CountForm from "./CountForm";
import EntryProgress from "./EntryProgress";
import ObserverInstructionsSheet from "./ObserverInstructionsSheet";
import SegmentSelector from "./SegmentSelector";
import {
  ScheduleWarningBanner,
  SegmentStartPrompt,
  SegmentTimerBar,
} from "./SegmentTimer";
import SessionResultsTable from "./SessionResultsTable";

interface CountSessionProps {
  session: Session;
  initialCountState: PersistedCountState;
  onPersist: (state: PersistedCountState) => void;
  onNewSession: () => void;
}

export default function CountSession({
  session,
  initialCountState,
  onPersist,
  onNewSession,
}: CountSessionProps) {
  const segments = useMemo(() => createSegments(session), [session]);
  const [countState, setCountState] =
    useState<PersistedCountState>(initialCountState);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    onPersist(countState);
  }, [countState, onPersist]);

  const {
    activeSegmentIndex,
    segmentStates,
    segmentEntries,
    formState,
    sessionEnded,
    sessionEndedAt,
  } = countState;

  const activeSegment = segments[activeSegmentIndex];
  const activeSegmentState = getSegmentState(segmentStates, activeSegmentIndex);
  const segmentIsStarted = isSegmentStarted(activeSegmentState);
  const segmentIsEnded = isSegmentEnded(activeSegmentState);
  const segmentStartedAtTime = segmentStartedAt(activeSegmentState);
  const currentEntries = segmentEntries[activeSegmentIndex] ?? [];
  const blockNextNavigation =
    segmentIsStarted && !segmentIsEnded && !sessionEnded;

  const handleStartSegment = () => {
    setCountState((prev) => ({
      ...prev,
      segmentStates: {
        ...prev.segmentStates,
        [activeSegmentIndex]: {
          status: "running",
          startedAt: new Date(),
        },
      },
    }));
  };

  const handleEndSegment = () => {
    setCountState((prev) => {
      const current = getSegmentState(prev.segmentStates, activeSegmentIndex);
      if (current.status !== "running") return prev;

      return {
        ...prev,
        segmentStates: {
          ...prev.segmentStates,
          [activeSegmentIndex]: {
            status: "ended",
            startedAt: current.startedAt,
            frozenRemainingMs: segmentCountdownRemaining(
              current.startedAt,
              new Date(),
            ),
          },
        },
      };
    });
  };

  const handleUnendSegment = () => {
    setCountState((prev) => {
      const current = getSegmentState(prev.segmentStates, activeSegmentIndex);
      if (current.status !== "ended") return prev;

      return {
        ...prev,
        segmentStates: {
          ...prev.segmentStates,
          [activeSegmentIndex]: {
            status: "running",
            startedAt: current.startedAt,
          },
        },
      };
    });
  };

  const handleSelectSegment = (index: number) => {
    if (sessionEnded) return;
    if (index > activeSegmentIndex && blockNextNavigation) return;

    setCountState((prev) => ({
      ...prev,
      activeSegmentIndex: index,
      formState: DEFAULT_FORM_STATE,
    }));
    setEditingEntryId(null);
  };

  const handleEndSession = () => {
    setShowEndConfirm(false);
    setCountState((prev) => ({
      ...prev,
      sessionEnded: true,
      sessionEndedAt: new Date(),
    }));
  };

  const handleSubmit = () => {
    if (sessionEnded || segmentIsEnded) return;

    if (editingEntryId) {
      setCountState((prev) => ({
        ...prev,
        segmentEntries: {
          ...prev.segmentEntries,
          [activeSegmentIndex]: (
            prev.segmentEntries[activeSegmentIndex] ?? []
          ).map((entry) =>
            entry.id === editingEntryId
              ? {
                  ...formToEntry(formState),
                  id: editingEntryId,
                  timestamp: entry.timestamp,
                }
              : entry,
          ),
        },
        formState: DEFAULT_FORM_STATE,
      }));
      setEditingEntryId(null);
      return;
    }

    setCountState((prev) => ({
      ...prev,
      segmentEntries: {
        ...prev.segmentEntries,
        [activeSegmentIndex]: [
          ...(prev.segmentEntries[activeSegmentIndex] ?? []),
          formToEntry(formState),
        ],
      },
      formState: DEFAULT_FORM_STATE,
    }));
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setCountState((prev) => ({ ...prev, formState: DEFAULT_FORM_STATE }));
  };

  const handleEditEntry = (entry: CountEntry) => {
    if (sessionEnded) return;
    setEditingEntryId(entry.id);
    setCountState((prev) => ({ ...prev, formState: entryToForm(entry) }));
  };

  const handleFormChange = (nextFormState: CountFormState) => {
    setCountState((prev) => ({ ...prev, formState: nextFormState }));
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-[53px] z-10 border-b border-neutral-200 bg-surface px-4 pb-3 pt-3">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h2 className="text-base font-semibold text-neutral-900">
            {session.location}
          </h2>
          {!sessionEnded && (
            <button
              type="button"
              onClick={() => setShowEndConfirm(true)}
              className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-red-600 ring-1 ring-red-200 active:bg-red-50"
            >
              End Session
            </button>
          )}
        </div>

        {!sessionEnded && (
          <SegmentSelector
            segments={segments}
            activeIndex={activeSegmentIndex}
            onSelect={handleSelectSegment}
            blockNext={blockNextNavigation}
          />
        )}

        {segmentIsStarted && segmentStartedAtTime && (
          <SegmentTimerBar
            startedAt={segmentStartedAtTime}
            frozenRemainingMs={segmentFrozenRemaining(activeSegmentState)}
            sessionEnded={sessionEnded}
            frozenClockAt={sessionEndedAt ?? undefined}
            showEndSegment={!segmentIsEnded && !sessionEnded}
            onEndSegment={handleEndSegment}
            showNext={
              segmentIsEnded &&
              !sessionEnded &&
              activeSegmentIndex < segments.length - 1
            }
            onNext={() => handleSelectSegment(activeSegmentIndex + 1)}
            onUnendSegment={handleUnendSegment}
          />
        )}
      </div>

      <main
        className={`flex flex-1 flex-col gap-4 px-4 pt-3 ${
          segmentIsStarted && !sessionEnded
            ? "pb-[calc(5.75rem+env(safe-area-inset-bottom))]"
            : "pb-[max(1rem,env(safe-area-inset-bottom))]"
        }`}
      >
        {sessionEnded ? (
          <>
            <SessionResultsTable
              session={session}
              segments={segments}
              segmentEntries={segmentEntries}
            />
            <button
              type="button"
              onClick={onNewSession}
              className="rounded-xl bg-white py-3 text-base font-semibold text-neutral-800 ring-1 ring-neutral-200 active:bg-neutral-50"
            >
              New Session
            </button>
          </>
        ) : (
          activeSegment && (
            <>
              {!segmentIsStarted && (
                <>
                  <ScheduleWarningBanner
                    segment={activeSegment}
                    session={session}
                  />
                  <SegmentStartPrompt
                    sessionEnded={sessionEnded}
                    onStart={handleStartSegment}
                  />
                </>
              )}
              {segmentIsStarted && (
                <>
                  <CountForm value={formState} onChange={handleFormChange} />
                  <EntryProgress
                    entries={currentEntries}
                    onEdit={handleEditEntry}
                  />
                </>
              )}
            </>
          )
        )}
      </main>

      {showEndConfirm && (
        <EndSessionConfirmDialog
          onCancel={() => setShowEndConfirm(false)}
          onConfirm={handleEndSession}
        />
      )}

      {showInstructions && (
        <ObserverInstructionsSheet onClose={() => setShowInstructions(false)} />
      )}

      {segmentIsStarted && !sessionEnded && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {editingEntryId ? (
            <div className="mx-auto flex max-w-lg gap-3">
              <button
                type="button"
                onClick={() => setShowInstructions(true)}
                aria-label="Observer instructions"
                className="flex shrink-0 items-center justify-center rounded-xl bg-white px-4 py-4 text-neutral-700 ring-1 ring-neutral-200 active:bg-neutral-50"
              >
                <Info size={22} />
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 rounded-xl bg-white py-4 text-lg font-bold text-red-600 ring-1 ring-red-200 active:bg-red-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={segmentIsEnded}
                className={`flex-1 rounded-xl py-4 text-lg font-bold ${
                  segmentIsEnded
                    ? "cursor-not-allowed bg-neutral-200 text-neutral-400"
                    : "bg-accent text-white active:bg-accent/90"
                }`}
              >
                Update
              </button>
            </div>
          ) : (
            <div className="mx-auto flex max-w-lg gap-3">
              <button
                type="button"
                onClick={() => setShowInstructions(true)}
                aria-label="Observer instructions"
                className="flex shrink-0 items-center justify-center rounded-xl bg-white px-4 py-4 text-neutral-700 ring-1 ring-neutral-200 active:bg-neutral-50"
              >
                <Info size={22} />
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={segmentIsEnded}
                className={`flex-1 rounded-xl py-4 text-lg font-bold ${
                  segmentIsEnded
                    ? "cursor-not-allowed bg-neutral-200 text-neutral-400"
                    : "bg-accent text-white active:bg-accent/90"
                }`}
              >
                Submit
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const bottomSheetDialogClassName =
  "fixed inset-0 z-50 m-0 h-dvh max-h-none w-full max-w-none border-none bg-transparent p-0 open:flex open:flex-col open:justify-end backdrop:bg-black/40 backdrop:[animation:sheet-fade-in_200ms_ease-out]";

function EndSessionConfirmDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    let dismissed = false;
    const handleClose = () => {
      if (!dismissed) onCancel();
    };

    dialog.addEventListener("close", handleClose);
    dialog.showModal();

    return () => {
      dismissed = true;
      dialog.removeEventListener("close", handleClose);
      if (dialog.open) dialog.close();
    };
  }, [onCancel]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="end-session-title"
      className={bottomSheetDialogClassName}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <div className="rounded-t-2xl border-t border-red-200 bg-red-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] [animation:sheet-slide-up_280ms_ease-out]">
        <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-red-200" />
        <h3
          id="end-session-title"
          className="text-base font-semibold text-red-900"
        >
          End session?
        </h3>
        <p className="mt-1 text-sm text-red-800">
          You won&apos;t be able to add more counts after ending this session.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg bg-white px-3 py-2.5 text-sm font-medium text-red-600 ring-1 ring-red-200 active:bg-red-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-red-600 px-3 py-2.5 text-sm font-medium text-white active:bg-red-700"
          >
            End Session
          </button>
        </div>
      </div>
    </dialog>
  );
}
