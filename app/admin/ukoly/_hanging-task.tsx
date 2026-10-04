"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { doTaskForChildAction } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";

export type HangingTask = { id: string; name: string; valueCzk: number; state: string };

/** D31 (tok 2A): a task on offer or running, which a parent can mark done themselves. */
export function HangingTaskRow({ task }: { task: HangingTask }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const doIt = () =>
    startTransition(async () => {
      setError(null);
      const res = await doTaskForChildAction(task.id);
      if (res.ok) {
        setConfirming(false);
        router.refresh();
      } else {
        setError(
          res.error === "invalid_state"
            ? "Mezitím se to změnilo, obnov stránku."
            : "Nepovedlo se, zkus to znovu.",
        );
      }
    });

  return (
    <li className="flex flex-col gap-2.5 rounded-tile border border-border bg-card px-[18px] py-4">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="text-[17px] font-semibold">{task.name}</span>
          <span className="text-sm text-muted-foreground">
            {task.valueCzk} Kč · {task.state}
          </span>
        </div>
        {!confirming && (
          <Button variant="outline" size="sm" onClick={() => setConfirming(true)}>
            Udělám já
          </Button>
        )}
      </div>
      {confirming && (
        <>
          <p className="text-[13px] leading-snug text-muted-foreground">Nikdo za něj nedostane peníze.</p>
          <div className="flex gap-2.5">
            <Button
              variant="outline"
              className="h-12 flex-1"
              onClick={() => setConfirming(false)}
              disabled={isPending}
            >
              Zrušit
            </Button>
            <Button className="flex-1" onClick={doIt} disabled={isPending}>
              Ano, hotovo
            </Button>
          </div>
        </>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </li>
  );
}
