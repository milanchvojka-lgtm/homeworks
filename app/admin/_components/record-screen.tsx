"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordScreenTimeAction } from "@/app/actions/screen-time";
import { ScreenOptions, type Offer } from "@/app/child/(tabs)/obrazovka/_screen-picker";
import { Button } from "@/components/ui/button";

/**
 * D19 (pen HWR · 03b): the main button on the child detail opens a bottom panel to record
 * screen time the child asked for outside the app. Same credit rule as the child's request.
 */
export function RecordScreen({
  userId,
  name,
  balanceCzk,
  affordableLabel,
  offers,
}: {
  userId: string;
  name: string;
  balanceCzk: number;
  /** "na 30 min" / null when not even the shortest block fits. */
  affordableLabel: string | null;
  offers: Offer[];
}) {
  const router = useRouter();
  const firstAffordable = offers.find((o) => o.affordable)?.minutes ?? null;
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(firstAffordable);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    if (selected === null) return;
    setError(null);
    startTransition(async () => {
      const res = await recordScreenTimeAction(userId, selected);
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(
          res.error === "insufficient_credit"
            ? "Nemá na to dost kreditu."
            : "Nepovedlo se, zkus to znovu.",
        );
      }
    });
  };

  return (
    <>
      <Button className="w-full" onClick={() => setOpen(true)}>
        Zapsat screen time
      </Button>

      {open && (
        <div className="fixed inset-0 z-20 flex flex-col justify-end">
          <button
            type="button"
            aria-label="Zavřít"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-label={`Zapsat screen time · ${name}`}
            className="relative flex flex-col gap-4 rounded-t-3xl bg-card px-4 pt-3 pb-[max(2.125rem,env(safe-area-inset-bottom))]"
          >
            <span className="mx-auto h-1 w-10 rounded-full bg-border" />
            <div className="flex flex-col gap-1">
              <h2 className="text-[22px] font-bold tracking-tight">Zapsat screen time · {name}</h2>
              <p className="text-[15px] text-muted-foreground">
                Má kredit {balanceCzk} Kč
                {affordableLabel ? `, to je ${affordableLabel}.` : ", to nestačí ani na nejkratší blok."}
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <h3 className="font-mono text-xs font-bold tracking-[0.12em] uppercase">
                Kolik koukala?
              </h3>
              <ScreenOptions
                offers={offers}
                selected={selected}
                onSelect={setSelected}
                disabled={isPending}
                unaffordableLabel="nemá kredit"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" onClick={submit} disabled={selected === null || isPending}>
              {selected === null ? "Zapsat" : `Zapsat ${selected} min`}
            </Button>
            <Button variant="outline" className="h-12 w-full" onClick={() => setOpen(false)}>
              Zrušit
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
