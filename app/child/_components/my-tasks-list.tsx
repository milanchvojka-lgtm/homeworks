"use client";

import { useEffect, useState, useTransition } from "react";
import type { TaskStatus } from "@prisma/client";
import { reportTaskDoneAction } from "@/app/actions/tasks";

type Item = {
  id: string;
  name: string;
  valueCzk: number;
  status: TaskStatus;
  executeDeadline: string | null;
  reviewNote: string | null;
};

export function MyTasksList({ items }: { items: Item[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {items.map((i) => (
        <Card key={i.id} item={i} />
      ))}
    </ul>
  );
}

function Card({ item }: { item: Item }) {
  const [optimisticStatus, setOptimisticStatus] = useState<TaskStatus>(
    item.status,
  );
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setOptimisticStatus("PENDING_REVIEW");
    startTransition(async () => {
      const res = await reportTaskDoneAction(item.id);
      if (!res.ok) setOptimisticStatus(item.status);
    });
  };

  return (
    <li
      className={`rounded-xl border p-4 ${cardCls(optimisticStatus)}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-sm font-medium">{item.name}</div>
          <div className="mt-0.5 text-xs text-zinc-500">{item.valueCzk} Kč</div>
        </div>
        <StatusBadge status={optimisticStatus} />
      </div>

      {optimisticStatus === "CLAIMED" && item.executeDeadline && (
        <Countdown deadline={item.executeDeadline} />
      )}

      {optimisticStatus === "REJECTED" && item.reviewNote && (
        <div className="mt-2 text-xs text-red-700 dark:text-red-400">
          Vráceno: {item.reviewNote}
        </div>
      )}

      {optimisticStatus === "CLAIMED" && (
        <button
          onClick={submit}
          disabled={isPending}
          className="mt-3 w-full rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Hotovo — nahlásit
        </button>
      )}
    </li>
  );
}

function Countdown({ deadline }: { deadline: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const remaining = new Date(deadline).getTime() - now;
  const overdue = remaining < 0;
  const abs = Math.abs(remaining);
  const hours = Math.floor(abs / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);

  return (
    <div
      className={`mt-2 text-xs ${overdue ? "text-red-600" : "text-zinc-500"}`}
    >
      {overdue ? "Po termínu" : "Zbývá"} {hours}h {minutes}m
    </div>
  );
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, { label: string; cls: string }> = {
    AVAILABLE: { label: "Dostupné", cls: "text-zinc-500" },
    CLAIMED: {
      label: "Vzal jsi",
      cls: "text-zinc-700 dark:text-zinc-300",
    },
    PENDING_REVIEW: {
      label: "⏳ Čeká",
      cls: "text-amber-700 dark:text-amber-400",
    },
    DONE: { label: "✅ Hotovo", cls: "text-emerald-700 dark:text-emerald-400" },
    EXPIRED: { label: "Vypršelo", cls: "text-zinc-500" },
    REJECTED: {
      label: "⚠️ Vráceno",
      cls: "text-red-700 dark:text-red-400",
    },
  };
  const { label, cls } = map[status];
  return <span className={`text-xs font-medium ${cls}`}>{label}</span>;
}

function cardCls(status: TaskStatus): string {
  switch (status) {
    case "PENDING_REVIEW":
      return "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30";
    case "REJECTED":
      return "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30";
    case "DONE":
      return "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30";
    default:
      return "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900";
  }
}
