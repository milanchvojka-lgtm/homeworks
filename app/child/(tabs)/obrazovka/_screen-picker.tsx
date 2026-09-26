"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { requestScreenTimeAction } from "@/app/actions/screen-time";

type Offer = { minutes: number; cost: number; affordable: boolean };

/** Choose 30/60/90 min and ask a parent (návrh 2, frame 03). */
export function ScreenPicker({ offers }: { offers: Offer[] }) {
  const firstAffordable = offers.find((o) => o.affordable)?.minutes ?? null;
  const [selected, setSelected] = useState<number | null>(firstAffordable);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    if (selected === null) return;
    setError(null);
    startTransition(async () => {
      const res = await requestScreenTimeAction(selected);
      if (!res.ok) {
        setError(
          res.error === "insufficient_credit"
            ? "Na to nemáš dost kreditu."
            : res.error === "invalid_minutes"
              ? "Neplatný výběr."
              : "Něco se nepovedlo.",
        );
      }
    });
  };

  const minCost = offers[0]?.cost ?? 0;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-mono text-xs font-bold tracking-[0.12em] uppercase">Kolik chceš?</h2>
      <div className="grid grid-cols-3 gap-2">
        {offers.map((o) => {
          const active = selected === o.minutes;
          return (
            <button
              key={o.minutes}
              type="button"
              disabled={!o.affordable || isPending}
              onClick={() => setSelected(o.minutes)}
              aria-pressed={active}
              className={`flex h-[72px] flex-col items-center justify-center gap-0.5 rounded-2xl border bg-card transition-colors disabled:opacity-40 ${
                active ? "border-2 border-highlight bg-highlight-soft" : "border-border"
              }`}
            >
              <span className={`text-[17px] ${active ? "font-bold" : "font-semibold"}`}>
                {o.minutes} min
              </span>
              <span className="font-mono text-sm text-muted-foreground">{o.cost} Kč</span>
            </button>
          );
        })}
      </div>
      {firstAffordable === null ? (
        <p className="text-sm text-muted-foreground">Potřebuješ aspoň {minCost} Kč.</p>
      ) : (
        <button
          type="button"
          onClick={submit}
          disabled={selected === null || isPending}
          className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-primary text-[17px] font-semibold text-primary-foreground disabled:opacity-50"
        >
          <Send className="size-[18px]" />
          Požádat o {selected} min
        </button>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
