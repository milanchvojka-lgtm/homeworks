"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { sendTestPushAction } from "@/app/actions/push";
import { disablePush, enablePush, getPushState, type PushState } from "@/lib/push-client";

/**
 * Pen `SettingRow` (D28, HWP · 02A–02d, 03): the reminders row in Já (child) and Víc (parent).
 * Turning it on asks iOS for permission (needs this tap) and sends a test notification.
 */
export function PushSettingRow({ role }: { role: "child" | "parent" }) {
  const [state, setState] = useState<PushState | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getPushState().then(setState).catch(() => setState("unsupported"));
  }, []);

  const status: Record<PushState, string> = {
    on: "Zapnuté",
    off: role === "child" ? "Vypnuté · zapni je, ať nepřijdeš o řadu" : "Vypnuté",
    blocked: "Nenastavené. Zapni v Nastavení → Oznámení → Homeworks.",
    unsupported: "Fungují jen v appce z plochy",
  };

  const toggle = (on: boolean) =>
    startTransition(async () => {
      if (!on) {
        setState(await disablePush());
        return;
      }
      const next = await enablePush();
      setState(next);
      if (next === "on") await sendTestPushAction();
    });

  return (
    <div className="flex items-center gap-3.5 rounded-tile border border-border bg-card py-3 pr-3.5 pl-4">
      <Bell className="size-[22px] shrink-0" />
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-[17px] font-semibold">{role === "child" ? "Připomínky" : "Upozornění"}</span>
        <span className="text-[13px] text-muted-foreground">{state ? status[state] : " "}</span>
      </span>
      {(state === "on" || state === "off") && (
        <Switch
          checked={state === "on"}
          disabled={isPending}
          onCheckedChange={toggle}
          aria-label={role === "child" ? "Připomínky" : "Upozornění"}
        />
      )}
    </div>
  );
}
