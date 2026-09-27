"use client";

import { useState, useTransition } from "react";
import type { TaskStatus } from "@prisma/client";
import { Check, Clock3, Hand, Hourglass, Lock, MessageCircle, Send, Timer, Undo2 } from "lucide-react";
import { claimTaskAction, reportTaskDoneAction } from "@/app/actions/tasks";
import { remaining } from "@/lib/deadline-pure";
import { formatTimePrague } from "./format";
import { SliderState, SwipeConfirm } from "./swipe-confirm";
import { useNow } from "./use-now";

export type TaskCardData = {
  id: string;
  name: string;
  valueCzk: number;
  timeEstimateMinutes: number | null;
  status: TaskStatus;
  executeDeadline: string | null;
  submittedAt: string | null;
  reviewNote: string | null;
  /** Pool only: why the task can't be taken now (null = can take). */
  lockedReason: string | null;
};

/**
 * Task card (návrh 2, pen `TaskCard · *`): estimate on top, name + reward, action.
 * AVAILABLE = offer / locked, CLAIMED = running with countdown, PENDING_REVIEW = waiting, REJECTED = returned,
 * DONE = approved and paid (pen `TaskCard · schváleno`, shown on Dnes until the end of the day).
 */
export function TaskCard({
  task,
  nowIso,
  poolLocked = false,
}: {
  task: TaskCardData;
  nowIso: string;
  /** Daily checks not submitted yet — reason is shown once above the list, not per card. */
  poolLocked?: boolean;
}) {
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [submittedAt, setSubmittedAt] = useState(task.submittedAt);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const now = useNow(nowIso);

  const locked = status === "AVAILABLE" && (poolLocked || task.lockedReason !== null);

  const claim = () => {
    setError(null);
    startTransition(async () => {
      const res = await claimTaskAction(task.id);
      if (!res.ok) {
        setError(
          res.error === "daily_checks_pending"
            ? "Nejdřív odešli dnešní povinnosti."
            : res.error === "race"
              ? "Někdo to vzal dřív."
              : "Nepovedlo se vzít úkol.",
        );
      }
    });
  };

  const report = () => {
    setError(null);
    const prev = status;
    setStatus("PENDING_REVIEW");
    setSubmittedAt(new Date().toISOString());
    startTransition(async () => {
      const res = await reportTaskDoneAction(task.id);
      if (!res.ok) {
        setStatus(prev);
        setError("Nepovedlo se odeslat. Zkus to znovu.");
      }
    });
  };

  const left =
    status === "CLAIMED" && task.executeDeadline
      ? remaining(new Date(task.executeDeadline), now)
      : null;

  return (
    <article
      className={`flex flex-col rounded-tile border bg-card px-[18px] pt-4 pb-[18px] ${
        status === "CLAIMED" ? "border-2 border-highlight" : "border-border"
      } ${locked ? "gap-1.5 opacity-55" : "gap-3"}`}
    >
      <div className="flex items-center gap-1.5 text-subtle">
        <Clock3 className="size-3.5" />
        <span className="font-mono text-[11px] font-bold tracking-wider">
          {task.timeEstimateMinutes ? `~${task.timeEstimateMinutes} MIN` : "BEZ ODHADU"}
        </span>
        <span className="ml-auto">
          {locked ? (
            <Lock className="size-3.5" />
          ) : left ? (
            <span
              className={`flex items-center gap-1.5 font-mono text-xs font-bold ${left.soon ? "text-warning" : "text-muted-foreground"}`}
            >
              <Timer className="size-3.5" />
              {left.text}
            </span>
          ) : (status === "PENDING_REVIEW" || status === "DONE") && submittedAt ? (
            <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-muted-foreground">
              <Send className="size-3.5" />
              odesláno {formatTimePrague(submittedAt)}
            </span>
          ) : status === "REJECTED" ? (
            <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-destructive">
              <Undo2 className="size-3.5" />
              vráceno
            </span>
          ) : null}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <h3 className="flex-1 text-xl leading-tight font-bold tracking-tight">{task.name}</h3>
        <span
          className={`font-mono text-xl font-bold ${status === "DONE" ? "text-success" : "text-highlight"}`}
        >
          {status === "DONE" ? `+${task.valueCzk}` : task.valueCzk} Kč
        </span>
      </div>

      {status === "AVAILABLE" && !poolLocked && task.lockedReason && (
        <p className="text-sm text-muted-foreground">{task.lockedReason}</p>
      )}

      {status === "REJECTED" && task.reviewNote && (
        <p className="flex gap-2.5 rounded-xl bg-danger-soft px-3.5 py-3 text-[15px]">
          <MessageCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <span>„{task.reviewNote}“</span>
        </p>
      )}

      {status === "AVAILABLE" && !locked && (
        <button
          type="button"
          onClick={claim}
          disabled={isPending}
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          <Hand className="size-[18px]" />
          Vzít úkol
        </button>
      )}
      {status === "CLAIMED" && (
        <SwipeConfirm label="Přejeď, až bude hotovo" onConfirm={report} disabled={isPending} />
      )}
      {status === "PENDING_REVIEW" && (
        <SliderState tone="warning" label="Čeká na schválení" icon={<Hourglass className="size-5" />} />
      )}
      {status === "DONE" && (
        <SliderState tone="success" label="Schváleno, připsáno" icon={<Check className="size-[22px]" />} />
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </article>
  );
}
