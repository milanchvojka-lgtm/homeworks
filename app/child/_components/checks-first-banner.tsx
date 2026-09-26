import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";

/**
 * "Nejdřív povinnosti" (návrh 2, pen `PovinnostiBanner`): shown once above the pool while today's checks
 * are not all sent; the task cards below only dim, the reason is not repeated per card.
 */
export function ChecksFirstBanner({
  sent,
  total,
  nextName,
}: {
  sent: number;
  total: number;
  nextName: string | null;
}) {
  const pct = total > 0 ? Math.round((sent / total) * 100) : 0;
  return (
    <section className="flex flex-col gap-3.5 rounded-tile border border-border bg-card p-[18px]">
      <div className="flex items-center gap-3.5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-warning-soft">
          <LockKeyhole className="size-[22px] text-warning" />
        </span>
        <div className="flex flex-col gap-0.5">
          <h2 className="text-lg font-bold tracking-tight">Nejdřív povinnosti</h2>
          <p className="text-sm text-muted-foreground">Úkoly se odemknou, až je odešleš.</p>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between gap-3 text-xs text-muted-foreground">
          <span className="font-mono font-bold">
            {sent} ze {total} hotovo
          </span>
          {nextName && <span className="truncate">zbývá {nextName}</span>}
        </div>
        <div className="h-2 rounded-full bg-muted">
          <div className="h-2 rounded-full bg-warning" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <Link
        href="/child"
        className="flex h-12 items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground"
      >
        Dokončit na Dnes
        <ArrowRight className="size-[18px]" />
      </Link>
    </section>
  );
}
