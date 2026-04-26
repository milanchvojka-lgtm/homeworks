"use client";

import { useState, useTransition } from "react";
import { requestScreenTimeAction } from "@/app/actions/screen-time";

type Offer = { minutes: number; cost: number };

export function ScreenTimeRequester({
  offers,
  balance,
}: {
  offers: Offer[];
  balance: number;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
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
        return;
      }
      setSubmitted(true);
    });
  };

  if (submitted) {
    return (
      <div className="mt-2 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
        ✅ Žádost odeslaná. Čekej na schválení.
      </div>
    );
  }

  return (
    <div className="mt-2 grid grid-cols-3 gap-2">
      {offers.map((o) => {
        const affordable = balance >= o.cost;
        const isSelected = selected === o.minutes;
        return (
          <button
            key={o.minutes}
            onClick={() => setSelected(o.minutes)}
            disabled={!affordable || isPending}
            className={`rounded-xl border p-3 text-sm transition disabled:opacity-40 ${
              isSelected
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            }`}
          >
            <div className="font-semibold">{o.minutes} min</div>
            <div className="mt-0.5 text-xs opacity-70">{o.cost} Kč</div>
          </button>
        );
      })}
      {selected !== null && (
        <button
          onClick={submit}
          disabled={isPending}
          className="col-span-3 mt-2 rounded-xl bg-emerald-600 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Požádat
        </button>
      )}
      {error && (
        <div className="col-span-3 text-xs text-red-600">{error}</div>
      )}
    </div>
  );
}
