"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendTestPushAction } from "@/app/actions/push";
import { disablePush, enablePush, getPushState, type PushState } from "@/lib/push-client";

const TEXT: Record<PushState, string> = {
  unsupported: "Funguje jen v appce přidané na plochu (iOS 16.4+).",
  off: "Vypnuté.",
  on: "Zapnuté.",
  blocked: "Zablokované. Zapni je v Nastavení → Oznámení → Homeworks.",
};

/**
 * TEMPORARY (D28, gate 9.0): technical switch to verify push on a real iPhone before the designed UI (9.6).
 * Not in pen on purpose; replaced by the switch from the D16 flow.
 */
export function PushSwitchTemp() {
  const [state, setState] = useState<PushState | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getPushState().then(setState).catch(() => setState("unsupported"));
  }, []);

  const toggle = () =>
    startTransition(async () => {
      setNote(null);
      if (state === "on") {
        setState(await disablePush());
        return;
      }
      const next = await enablePush();
      setState(next);
      if (next === "on") {
        const r = await sendTestPushAction();
        setNote(r.ok ? "Zkušební upozornění odesláno." : "Zkušební upozornění se nepodařilo doručit.");
      }
    });

  return (
    <section className="flex flex-col gap-3 rounded-tile border border-border bg-card p-[18px]">
      <span className="font-mono text-[11px] font-bold tracking-wider text-subtle uppercase">
        Připomínky (test)
      </span>
      <p className="text-sm text-muted-foreground">{state ? TEXT[state] : "…"}</p>
      {note && <p className="text-sm">{note}</p>}
      {(state === "on" || state === "off") && (
        <Button variant="outline" onClick={toggle} disabled={isPending}>
          <Bell className="size-4" />
          {state === "on" ? "Vypnout připomínky" : "Zapnout připomínky"}
        </Button>
      )}
    </section>
  );
}
