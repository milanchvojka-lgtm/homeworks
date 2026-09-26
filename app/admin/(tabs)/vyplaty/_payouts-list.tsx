"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { markPayoutPaidAction } from "@/app/actions/payouts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

/** Pen HWR · 04: unpaid weeks with a "Vyplaceno" action per child, paid weeks collapsed below. */
export function PayoutsList({ payouts }: { payouts: Payout[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [openWeek, setOpenWeek] = useState<string | null>(null);

  const weeks = new Map<string, Payout[]>();
  for (const p of payouts) weeks.set(p.weekStart, [...(weeks.get(p.weekStart) ?? []), p]);
  const unpaid = [...weeks.entries()].filter(([, items]) => items.some((p) => !p.paidOutAt));
  const paid = [...weeks.entries()].filter(([, items]) => items.every((p) => p.paidOutAt));

  const markPaid = (id: string) =>
    startTransition(async () => {
      await markPayoutPaidAction(id);
      // "already_paid" means the other parent did it; the refresh shows it either way.
      router.refresh();
    });

  const label = (text: string) => (
    <h2 className="mt-1 font-mono text-xs font-bold tracking-[0.12em] uppercase">{text}</h2>
  );

  return (
    <>
      {unpaid.map(([weekStart, items]) => (
        <section key={weekStart} className="flex flex-col gap-3">
          {label(`K výplatě · ${formatWeek(weekStart, items[0].weekEnd)}`)}
          {items.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-2.5 rounded-tile border border-border bg-card px-4 pt-3.5 pb-4"
            >
              <Link href={`/admin/deti/${p.user.id}`} className="flex items-center gap-3">
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white"
                  style={{ backgroundColor: p.user.avatarColor }}
                >
                  {p.user.name[0]}
                </span>
                <span className="flex-1 text-[17px] font-semibold">{p.user.name}</span>
                <span className="font-mono text-xl font-bold">{p.totalPayoutCzk} Kč</span>
              </Link>
              <span className="font-mono text-xs text-muted-foreground">{breakdown(p)}</span>
              {p.paidOutAt ? (
                <Badge variant="success" className="self-start">
                  <Check />
                  Vyplaceno {formatDay(p.paidOutAt)}
                </Badge>
              ) : (
                <Button
                  variant="outline"
                  className="h-11 w-full"
                  onClick={() => markPaid(p.id)}
                  disabled={isPending}
                >
                  Vyplaceno
                </Button>
              )}
            </div>
          ))}
        </section>
      ))}

      {paid.length > 0 && label("Vyplaceno")}
      {paid.map(([weekStart, items]) => {
        const open = openWeek === weekStart;
        const paidOn = items.map((p) => p.paidOutAt!).sort().at(-1)!;
        return (
          <div
            key={weekStart}
            className={`rounded-tile border bg-card ${open ? "border-foreground" : "border-border"}`}
          >
            <button
              type="button"
              onClick={() => setOpenWeek(open ? null : weekStart)}
              aria-expanded={open}
              className="flex min-h-14 w-full items-center gap-3 pr-3.5 pl-[18px] text-left"
            >
              <span className="flex-1 text-base font-semibold">
                {formatWeek(weekStart, items[0].weekEnd)}
              </span>
              <span className="font-mono text-[15px] font-bold">
                {items.reduce((s, p) => s + p.totalPayoutCzk, 0)} Kč
              </span>
              <Badge variant="success">
                <Check />
                {formatDay(paidOn)}
              </Badge>
              {open ? (
                <ChevronUp className="size-[18px] text-subtle" />
              ) : (
                <ChevronDown className="size-[18px] text-subtle" />
              )}
            </button>
            {open && (
              <ul className="flex flex-col gap-2 px-[18px] pb-4">
                {items.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/deti/${p.user.id}`} className="flex items-center gap-2">
                      <span className="flex-1 text-[15px] font-semibold">{p.user.name}</span>
                      <span className="font-mono text-[15px] font-bold">{p.totalPayoutCzk} Kč</span>
                    </Link>
                    <span className="font-mono text-xs text-muted-foreground">{breakdown(p)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </>
  );
}

function breakdown(p: Payout): string {
  return [
    `vyděláno ${p.totalEarnedCzk}`,
    p.totalScreenTimeCzk > 0 ? `obrazovka −${p.totalScreenTimeCzk}` : null,
    p.bonusCzk > 0 ? `bonus +${p.bonusCzk}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function formatDay(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", timeZone: "Europe/Prague" })
    .replace(/\s/g, " ");
}

function formatWeek(start: string, end: string): string {
  const f = (s: string) =>
    new Date(s)
      .toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", timeZone: "Europe/Prague" })
      .replace(/\s/g, "");
  const [sd, sm] = f(start).split(".");
  const e = f(end);
  const [, em] = e.split(".");
  return sm === em ? `${sd}.–${e}` : `${f(start)}–${e}`;
}
