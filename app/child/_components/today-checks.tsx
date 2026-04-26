"use client";

import { useState, useTransition } from "react";
import type { CheckStatus, TimeOfDay } from "@prisma/client";
import { submitCheckAction } from "@/app/actions/checks";

type Instance = {
  id: string;
  name: string;
  timeOfDay: TimeOfDay;
  status: CheckStatus;
  note: string | null;
};

const SECTIONS: { key: TimeOfDay; label: string }[] = [
  { key: "MORNING", label: "Ráno" },
  { key: "EVENING", label: "Večer" },
  { key: "ANYTIME", label: "Kdykoliv" },
];

export function TodayChecks({ instances }: { instances: Instance[] }) {
  const grouped: Record<TimeOfDay, Instance[]> = {
    MORNING: [],
    EVENING: [],
    ANYTIME: [],
  };
  for (const i of instances) grouped[i.timeOfDay].push(i);

  return (
    <div className="space-y-6">
      {SECTIONS.map((s) =>
        grouped[s.key].length === 0 ? null : (
          <section key={s.key}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {s.label}
            </h2>
            <ul className="space-y-2">
              {grouped[s.key].map((i) => (
                <CheckRow key={i.id} instance={i} />
              ))}
            </ul>
          </section>
        ),
      )}
    </div>
  );
}

function CheckRow({ instance }: { instance: Instance }) {
  const [optimisticStatus, setOptimisticStatus] = useState<CheckStatus>(
    instance.status,
  );
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setOptimisticStatus("SUBMITTED");
    startTransition(async () => {
      const res = await submitCheckAction(instance.id);
      if (!res.ok) setOptimisticStatus(instance.status);
    });
  };

  const canSubmit =
    optimisticStatus === "PENDING" || optimisticStatus === "REJECTED";

  return (
    <li
      className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${rowClass(optimisticStatus)}`}
    >
      <div className="flex-1">
        <div className="text-sm font-medium">{instance.name}</div>
        {optimisticStatus === "REJECTED" && instance.note ? (
          <div className="mt-1 text-xs text-red-600 dark:text-red-400">
            Vráceno: {instance.note}
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <StatusBadge status={optimisticStatus} />
        {canSubmit && (
          <button
            onClick={submit}
            disabled={isPending}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Hotovo
          </button>
        )}
      </div>
    </li>
  );
}

function rowClass(status: CheckStatus): string {
  switch (status) {
    case "APPROVED":
      return "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30";
    case "REJECTED":
      return "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30";
    case "MISSED":
      return "border-zinc-200 bg-zinc-100 opacity-60 dark:border-zinc-800 dark:bg-zinc-900";
    case "SUBMITTED":
      return "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30";
    default:
      return "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900";
  }
}

function StatusBadge({ status }: { status: CheckStatus }) {
  const map: Record<CheckStatus, { label: string; cls: string }> = {
    PENDING: { label: "—", cls: "text-zinc-400" },
    SUBMITTED: { label: "⏳ Čeká", cls: "text-amber-700 dark:text-amber-400" },
    APPROVED: { label: "✅ OK", cls: "text-emerald-700 dark:text-emerald-400" },
    REJECTED: { label: "⚠️ Vráceno", cls: "text-red-700 dark:text-red-400" },
    MISSED: { label: "Zmeškáno", cls: "text-zinc-500" },
  };
  const { label, cls } = map[status];
  return <span className={`text-xs font-medium ${cls}`}>{label}</span>;
}
