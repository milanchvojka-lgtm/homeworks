"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelScreenTimeAction, recordScreenTimeAction } from "@/app/actions/screen-time";
import { formatCzk, formatMinutes } from "@/app/child/_components/format";
import { Button } from "@/components/ui/button";

export type RecordChild = { id: string; name: string; avatarColor: string; netCzk: number };

const pick = (on: boolean) =>
  `flex flex-col items-center justify-center rounded-2xl bg-card transition-colors ${
    on ? "border-2 border-highlight bg-highlight-soft" : "border border-border"
  }`;

/**
 * D30 (pen HWS · 01B): record screen time approved in iOS — how long, for whom, save.
 * Nothing is preselected; credit never blocks it.
 */
export function RecordScreen({
  kids,
  options,
}: {
  kids: RecordChild[];
  options: { minutes: number; costCzk: number }[];
}) {
  const router = useRouter();
  const [minutes, setMinutes] = useState<number | null>(null);
  const [childId, setChildId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const child = kids.find((k) => k.id === childId);

  const submit = () => {
    if (minutes === null || !childId) return;
    setError(null);
    startTransition(async () => {
      const res = await recordScreenTimeAction(childId, minutes);
      if (res.ok) {
        setMinutes(null);
        setChildId(null);
        router.refresh();
      } else {
        setError("Nepovedlo se, zkus to znovu.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="mt-1 font-mono text-xs font-bold tracking-[0.12em] uppercase">Kolik</h2>
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => (
          <button
            key={o.minutes}
            type="button"
            aria-pressed={minutes === o.minutes}
            disabled={isPending}
            onClick={() => setMinutes(o.minutes)}
            className={`${pick(minutes === o.minutes)} h-[72px] gap-0.5`}
          >
            <span className={`text-[17px] ${minutes === o.minutes ? "font-bold" : "font-semibold"}`}>
              {formatMinutes(o.minutes)}
            </span>
            <span className="font-mono text-sm text-muted-foreground">{o.costCzk} Kč</span>
          </button>
        ))}
      </div>

      <h2 className="mt-1 font-mono text-xs font-bold tracking-[0.12em] uppercase">Komu</h2>
      <div className="grid grid-cols-3 gap-2">
        {kids.map((k) => (
          <button
            key={k.id}
            type="button"
            aria-pressed={childId === k.id}
            disabled={isPending}
            onClick={() => setChildId(k.id)}
            className={`${pick(childId === k.id)} gap-1 px-1.5 py-3.5`}
          >
            <span
              className="flex size-9 items-center justify-center rounded-full text-base font-bold text-white"
              style={{ backgroundColor: k.avatarColor }}
            >
              {k.name.charAt(0)}
            </span>
            <span className={`text-base ${childId === k.id ? "font-bold" : "font-semibold"}`}>{k.name}</span>
            <span className="text-[13px] text-subtle">kredit</span>
            <span className={`font-mono text-sm ${k.netCzk < 0 ? "text-destructive" : "text-muted-foreground"}`}>
              {formatCzk(k.netCzk)}
            </span>
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button className="w-full" onClick={submit} disabled={minutes === null || !child || isPending}>
        {minutes !== null && child ? `Zapsat ${child.name} ${formatMinutes(minutes)}` : "Zapsat"}
      </Button>
    </div>
  );
}

/** D30: undo today's record (a mistake); the child gets a push. */
export function CancelRecord({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const res = await cancelScreenTimeAction(id);
          if (res.ok) router.refresh();
          else setFailed(true);
        })
      }
      className="-my-3 py-3 pl-3 text-sm font-semibold text-destructive disabled:opacity-40"
    >
      {failed ? "Nejde zrušit" : "Zrušit"}
    </button>
  );
}
