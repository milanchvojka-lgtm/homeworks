"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronUp, Hourglass, Undo2, X } from "lucide-react";
import { excuseDayAction } from "@/app/actions/checks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ChipState, WeekDay } from "./child-days";

/** StateChip for a day or a check: colour + text, never colour alone. */
export function StateChip({ state, openCount }: { state: ChipState; openCount?: number }) {
  switch (state) {
    case "done":
      return (
        <Badge variant="success">
          <Check />
          Hotovo
        </Badge>
      );
    case "waiting":
      return (
        <Badge variant="warning">
          <Hourglass />
          Čeká
        </Badge>
      );
    case "returned":
      return (
        <Badge variant="danger">
          <Undo2 />
          Vráceno
        </Badge>
      );
    case "missed":
      return (
        <Badge variant="danger">
          <X />
          Zmeškáno
        </Badge>
      );
    case "away":
      return <Badge variant="neutral">Pryč</Badge>;
    case "open":
      return <Badge variant="neutral">{openCount ? `Zbývá ${openCount}` : "Zbývá"}</Badge>;
    default:
      return <Badge variant="neutral">Bez povinností</Badge>;
  }
}

/** Pen `DayRow` / `DayRow · rozbalený`: a day of the week, expands to its checks; a failed day can be excused (D20). */
export function DayRow({ day, userId }: { day: WeekDay; userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const expandable = day.checks.length > 0;

  const excuse = () =>
    startTransition(async () => {
      setError(null);
      const res = await excuseDayAction(userId, day.iso);
      if (res.ok) {
        setConfirming(false);
        router.refresh();
      } else {
        setError(
          res.error === "out_of_window" || res.error === "month_closed"
            ? "Tenhle den už uznat nejde."
            : "Nepovedlo se, zkus to znovu.",
        );
      }
    });

  return (
    <div
      className={`rounded-tile border bg-card ${open ? "border-foreground" : "border-border"}`}
    >
      <button
        type="button"
        disabled={!expandable}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-14 w-full items-center gap-3 pr-3.5 pl-[18px] text-left"
      >
        <span className="flex-1 text-base font-semibold">{day.label}</span>
        {/* Expanded, the checks carry the state; the day chip would repeat it. */}
        {!open && <StateChip state={day.state} openCount={day.openCount} />}
        {expandable &&
          (open ? (
            <ChevronUp className="size-[18px] text-subtle" />
          ) : (
            <ChevronDown className="size-[18px] text-subtle" />
          ))}
      </button>

      {open && (
        <div className="flex flex-col gap-3.5 px-[18px] pb-[18px]">
          <ul className="flex flex-col gap-2.5">
            {day.checks.map((c) => (
              <li key={c.id} className="flex items-center gap-2.5">
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-[15px] font-semibold">{c.name}</span>
                  <span className="text-[13px] text-muted-foreground">{c.meta}</span>
                </div>
                <StateChip state={c.state} />
              </li>
            ))}
          </ul>

          {day.canExcuse && (
            <>
              <p className="text-[13px] leading-snug text-muted-foreground">
                Uznáním se den počítá jako splněný. Řada a bonus se vrátí.
              </p>
              {confirming ? (
                <div className="flex gap-2.5">
                  <Button
                    variant="outline"
                    className="h-12 flex-1"
                    onClick={() => setConfirming(false)}
                    disabled={isPending}
                  >
                    Zrušit
                  </Button>
                  <Button className="flex-1" onClick={excuse} disabled={isPending}>
                    Ano, uznat
                  </Button>
                </div>
              ) : (
                <Button variant="outline" className="h-12 w-full" onClick={() => setConfirming(true)}>
                  Uznat den
                </Button>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
