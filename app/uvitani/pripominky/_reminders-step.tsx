"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, House } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendTestPushAction } from "@/app/actions/push";
import { enablePush, getPushState } from "@/lib/push-client";

/** Pen HWP · 01 (ask) and 01b (denied in iOS): WelcomeStep layout, one sentence, one button. */
export function RemindersStep() {
  const router = useRouter();
  const [blocked, setBlocked] = useState(false);
  const [isPending, startTransition] = useTransition();
  const toToday = () => router.replace("/child");

  // Opened in Safari instead of the Home Screen app, or already on: nothing to ask here.
  useEffect(() => {
    getPushState().then((s) => {
      if (s === "unsupported" || s === "on") router.replace("/child");
      if (s === "blocked") setBlocked(true);
    });
  }, [router]);

  const turnOn = () =>
    startTransition(async () => {
      const state = await enablePush();
      if (state === "on") {
        await sendTestPushAction();
        toToday();
      } else if (state === "blocked") {
        setBlocked(true);
      } else {
        toToday();
      }
    });

  return (
    <main className="flex h-dvh flex-col bg-background pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(2.125rem,env(safe-area-inset-bottom))]">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4">
        <div className="my-auto flex flex-col items-center gap-3.5 py-4 text-center">
          {blocked ? <BellOff className="size-14 text-highlight" /> : <Bell className="size-14 text-highlight" />}
          <h1 className="text-[28px] leading-tight font-bold tracking-tight">
            {blocked ? "Připomínky jsou vypnuté" : "Připomenu ti to"}
          </h1>
          <p className="text-[17px] leading-snug text-muted-foreground">
            {blocked
              ? "Zapneš je v Nastavení → Oznámení → Homeworks."
              : "Když ti večer něco zbývá, připomenu ti to. Ať nepřijdeš o řadu."}
          </p>
          {!blocked && (
            <div className="flex w-full items-start gap-3 rounded-tile border border-border bg-card p-3.5 text-left">
              <span className="flex size-[38px] shrink-0 items-center justify-center rounded-lg bg-highlight">
                <House className="size-5 text-foreground" />
              </span>
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="font-mono text-xs font-bold tracking-wider text-subtle">HOMEWORKS · 19:30</span>
                <span className="text-[15px] font-semibold">Ještě ti něco zbývá</span>
                <span className="text-[13px] text-muted-foreground">
                  Zbývají ti 2 povinnosti. Odškrtni to do půlnoci, ať nepřijdeš o řadu.
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 px-4">
        {blocked ? (
          <Button className="w-full" onClick={toToday}>
            Pokračovat
          </Button>
        ) : (
          <>
            <Button className="w-full" disabled={isPending} onClick={turnOn}>
              Zapnout připomínky
            </Button>
            <button
              type="button"
              onClick={toToday}
              disabled={isPending}
              className="flex h-11 items-center justify-center text-base font-semibold text-muted-foreground"
            >
              Teď ne
            </button>
          </>
        )}
      </div>
    </main>
  );
}
