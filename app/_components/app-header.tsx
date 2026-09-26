import { BackButton } from "./back-button";

/** Czech vocative for the greeting. Only names that change are listed; others are used as they are. */
const VOCATIVE: Record<string, string> = { Milan: "Milane" };

/**
 * App header on every tab (header C6, iteration 8; pen `AppHeader C6`): quiet white bar with
 * wordmark + greeting so attention stays on the content below. Shared by the child and parent parts.
 */
export function AppHeader({ name }: { name: string }) {
  return (
    <header className="border-b border-border bg-card px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[18px]">
      <p className="font-mono text-[11px] font-bold tracking-[0.18em]">HOMEWORKS</p>
      <h1 className="mt-0.5 text-[26px] font-bold tracking-tight">
        Ahoj, {VOCATIVE[name] ?? name} 👋
      </h1>
    </header>
  );
}

/** Header of a subpage: back arrow + title instead of the greeting (pen „Hlavička zpět"). */
export function BackHeader({ title, fallbackHref }: { title: string; fallbackHref: string }) {
  return (
    <header className="border-b border-border bg-card px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
      <div className="flex items-center gap-1">
        <BackButton fallbackHref={fallbackHref} />
        <h1 className="text-[22px] font-bold tracking-tight">{title}</h1>
      </div>
    </header>
  );
}
