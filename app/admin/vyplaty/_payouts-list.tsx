"use client";

import { useState, useTransition } from "react";
import { markPayoutPaidAction } from "@/app/actions/payouts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Týden {formatWeek(weekStart, items[0].weekEnd)}
          </h2>
          <ul className="space-y-2">
            {items.map((p) => {
              const paid = paidIds.has(p.id);
              return (
                <li key={p.id}>
                  <Card className={paid ? "opacity-70" : ""}>
                    <CardContent className="p-3">
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
                            <div className="text-xs text-muted-foreground">
                              {p.totalEarnedCzk} Kč vyděláno • {p.totalScreenTimeCzk}{" "}
                              Kč obrazovka
                              {p.bonusCzk > 0 && ` • +${p.bonusCzk} Kč bonus`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className="text-base font-semibold tabular-nums"
                            style={{ color: "var(--chart-1)" }}
                          >
                            {p.totalPayoutCzk} Kč
                          </div>
                          {paid ? (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              Vyplaceno
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              className="mt-1"
                              onClick={() => markPaid(p.id)}
                              disabled={isPending}
                            >
                              Vyplaceno
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
