"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAbsenceAction } from "@/app/actions/absence";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ERRORS: Record<string, string> = {
  before_week: "Od může být nejdřív pondělí tohoto týdne.",
  month_closed: "Minulý měsíc je uzavřený, od může být nejdřív 1. den tohoto měsíce.",
  to_before_from: "Do musí být stejně nebo později než od.",
  no_children: "Vyber aspoň jedno dítě.",
  invalid_date: "Zadej obě data.",
};

/** Pen HWN · 01b: bottom panel — who (children or all), from, to, note. */
export function AddAbsence({
  kids,
  today,
  earliest,
}: {
  kids: { id: string; name: string }[];
  today: string;
  earliest: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [who, setWho] = useState<Set<string>>(new Set());
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const all = kids.length > 0 && who.size === kids.length;
  const toggle = (id: string) =>
    setWho((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const reset = () => {
    setWho(new Set());
    setFrom(today);
    setTo(today);
    setNote("");
    setError(null);
  };

  const save = () => {
    setError(null);
    if (who.size === 0) return setError(ERRORS.no_children);
    startTransition(async () => {
      const res = await createAbsenceAction({ userIds: [...who], from, to, note });
      if (res.ok) {
        setOpen(false);
        reset();
        router.refresh();
      } else setError(ERRORS[res.error] ?? "Nepovedlo se, zkus to znovu.");
    });
  };

  const chip = (active: boolean) =>
    `h-10 rounded-full px-4 text-[15px] ${
      active ? "border-2 border-highlight bg-highlight-soft font-bold" : "border border-border bg-card font-medium"
    }`;
  const label = "font-mono text-[11px] font-bold tracking-wider text-subtle uppercase";

  return (
    <>
      <Button className="w-full" onClick={() => setOpen(true)}>
        Přidat nepřítomnost
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
            aria-label="Přidat nepřítomnost"
            className="relative flex flex-col gap-4 rounded-t-3xl bg-card px-4 pt-3 pb-[max(2.125rem,env(safe-area-inset-bottom))]"
          >
            <span className="mx-auto h-1 w-10 rounded-full bg-border" />
            <h2 className="text-[22px] font-bold tracking-tight">Přidat nepřítomnost</h2>

            <div className="flex flex-col gap-2">
              <span className={label}>Kdo</span>
              <div className="flex flex-wrap gap-2">
                {kids.map((k) => (
                  <button key={k.id} type="button" aria-pressed={who.has(k.id)} className={chip(who.has(k.id))} onClick={() => toggle(k.id)}>
                    {k.name}
                  </button>
                ))}
                <button
                  type="button"
                  aria-pressed={all}
                  className={chip(all)}
                  onClick={() => setWho(all ? new Set() : new Set(kids.map((k) => k.id)))}
                >
                  Všichni
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className={label}>Od</span>
                <Input
                  type="date"
                  value={from}
                  min={earliest}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    if (e.target.value > to) setTo(e.target.value);
                  }}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={label}>Do</span>
                <Input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className={label}>Poznámka (volitelné)</span>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="tábor, chalupa, nemoc" />
            </label>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" onClick={save} disabled={isPending}>
              Uložit
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
