"use client";

import { useState, useTransition } from "react";
import { markPayoutPaidAction } from "@/app/actions/payouts";

type Payout = {
  id: string;
  weekStart: string;
  weekEnd: string;
  user: { id: string; name: string; avatarColor: string };
  totalEarnedCzk: number;
  totalScreenTimeCzk: number;
  bonusCzk: number;
  totalPayoutCzk: number;
  paidOutAt: string | null;
};

export function PayoutsList({ payouts }: { payouts: Payout[] }) {
  const [paidIds, setPaidIds] = useState<Set<string>>(
    new Set(payouts.filter((p) => p.paidOutAt).map((p) => p.id)),
  );
  const [isPending, startTransition] = useTransition();

  const groups = new Map<string, Payout[]>();
  for (const p of payouts) {
    const key = p.weekStart;
    (groups.get(key) ?? groups.set(key, []).get(key))!.push(p);
  }

  const markPaid = (id: string) => {
    startTransition(async () => {
      const res = await markPayoutPaidAction(id);
      if (res.ok) setPaidIds((s) => new Set(s).add(id));
    });
  };

  return (
    <div className="mt-6 space-y-6">
      {Array.from(groups.entries()).map(([weekStart, items]) => (
        <section key={weekStart}>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Týden {formatWeek(weekStart, items[0].weekEnd)}
          </h2>
          <ul className="space-y-2">
            {items.map((p) => {
              const paid = paidIds.has(p.id);
              return (
                <li
                  key={p.id}
                  className={`rounded-xl border p-3 ${
                    paid
                      ? "border-zinc-200 bg-zinc-50 opacity-70 dark:border-zinc-800 dark:bg-zinc-900/50"
                      : "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: p.user.avatarColor }}
                      >
                        {p.user.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{p.user.name}</div>
                        <div className="text-xs text-zinc-500">
                          {p.totalEarnedCzk} Kč vyděláno • {p.totalScreenTimeCzk}{" "}
                          Kč obrazovka
                          {p.bonusCzk > 0 && ` • +${p.bonusCzk} Kč bonus`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-semibold">
                        {p.totalPayoutCzk} Kč
                      </div>
                      {paid ? (
                        <div className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
                          ✅ Vyplaceno
                        </div>
                      ) : (
                        <button
                          onClick={() => markPaid(p.id)}
                          disabled={isPending}
                          className="mt-1 rounded-lg bg-zinc-900 px-3 py-1 text-xs font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
                        >
                          Vyplaceno
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

function formatWeek(start: string, end: string): string {
  const fmt = (s: string) =>
    new Date(s).toLocaleDateString("cs-CZ", {
      day: "numeric",
      month: "numeric",
    });
  return `${fmt(start)} – ${fmt(end)}`;
}
