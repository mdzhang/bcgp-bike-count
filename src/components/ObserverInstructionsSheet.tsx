import { useEffect, useRef } from "react";
import { OBSERVER_INSTRUCTIONS } from "../constants/observerInstructions";

interface ObserverInstructionsSheetProps {
  onClose: () => void;
}

const bottomSheetDialogClassName =
  "fixed inset-0 z-50 m-0 h-dvh max-h-none w-full max-w-none border-none bg-transparent p-0 open:flex open:flex-col open:justify-end backdrop:bg-black/40 backdrop:[animation:sheet-fade-in_200ms_ease-out]";

export default function ObserverInstructionsSheet({
  onClose,
}: ObserverInstructionsSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    let dismissed = false;
    const handleClose = () => {
      if (!dismissed) onClose();
    };

    dialog.addEventListener("close", handleClose);
    dialog.showModal();

    return () => {
      dismissed = true;
      dialog.removeEventListener("close", handleClose);
      if (dialog.open) dialog.close();
    };
  }, [onClose]);

  const dismiss = () => onClose();

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="observer-instructions-title"
      className={bottomSheetDialogClassName}
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
    >
      <div className="max-h-[70dvh] overflow-y-auto rounded-t-2xl border-t border-neutral-200 bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] [animation:sheet-slide-up_280ms_ease-out]">
        <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-neutral-300" />
        <h3
          id="observer-instructions-title"
          className="text-base font-semibold text-neutral-900"
        >
          {OBSERVER_INSTRUCTIONS.title}
        </h3>
        <p className="mt-2 text-sm text-neutral-600">
          {OBSERVER_INSTRUCTIONS.intro}
        </p>

        <div className="mt-4 space-y-4 text-sm text-neutral-800">
          {OBSERVER_INSTRUCTIONS.sections.map((section) => (
            <section key={section.heading}>
              <h4 className="font-semibold text-neutral-900">
                {section.heading}
              </h4>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-neutral-700">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}

          <section>
            <h4 className="font-semibold text-neutral-900">Tips</h4>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-neutral-700">
              {OBSERVER_INSTRUCTIONS.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="mt-4 w-full rounded-lg bg-neutral-800 px-3 py-2.5 text-sm font-medium text-white active:bg-neutral-700"
        >
          Close
        </button>
      </div>
    </dialog>
  );
}
