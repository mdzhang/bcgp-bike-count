import { BCGP_NAME, BCGP_URL } from "../constants";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-surface">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
        <h1 className="text-base font-semibold tracking-tight text-neutral-900">
          Bike Count
        </h1>
        <a
          href={BCGP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-right text-xs text-muted underline-offset-2 hover:text-neutral-900 hover:underline"
        >
          {BCGP_NAME}
        </a>
      </div>
    </header>
  );
}
