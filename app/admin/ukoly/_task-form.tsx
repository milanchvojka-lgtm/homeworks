"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTaskAction, updateTaskAction } from "@/app/actions/tasks";

type Mode =
  | { kind: "create" }
  | {
      kind: "edit";
      id: string;
      isActive: boolean;
    };

type Initial = {
  name: string;
  description: string;
  valueCzk: number;
  timeEstimateMinutes: number | null;
  frequencyDays: number | null;
  claimTimeoutHours: number;
  executeTimeoutHours: number;
};

export function TaskForm({
  mode,
  initial,
}: {
  mode: Mode;
  initial: Initial;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [valueCzk, setValueCzk] = useState(initial.valueCzk);
  const [timeEstimate, setTimeEstimate] = useState<number | null>(
    initial.timeEstimateMinutes,
  );
  const [recurring, setRecurring] = useState(initial.frequencyDays !== null);
  const [frequencyDays, setFrequencyDays] = useState(initial.frequencyDays ?? 7);
  const [claimTimeout, setClaimTimeout] = useState(initial.claimTimeoutHours);
  const [executeTimeout, setExecuteTimeout] = useState(
    initial.executeTimeoutHours,
  );
  const [isActive, setIsActive] = useState(
    mode.kind === "edit" ? mode.isActive : true,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const payload = {
        name,
        description: description || null,
        valueCzk,
        timeEstimateMinutes: timeEstimate,
        frequencyDays: recurring ? frequencyDays : null,
        claimTimeoutHours: claimTimeout,
        executeTimeoutHours: executeTimeout,
      };

      if (mode.kind === "create") {
        const res = await createTaskAction(payload);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        router.push("/admin/ukoly");
      } else {
        const res = await updateTaskAction(mode.id, { ...payload, isActive });
        if (!res.ok) {
          setError(res.error);
          return;
        }
        router.push("/admin/ukoly");
      }
    });
  };

  return (
    <div className="mt-6 max-w-xl space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <Field label="Název">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field label="Popis (volitelné)">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Hodnota (Kč)">
          <input
            type="number"
            min={0}
            value={valueCzk}
            onChange={(e) => setValueCzk(Number(e.target.value))}
            className={inputCls}
          />
        </Field>
        <Field label="Odhad času (min, volitelné)">
          <input
            type="number"
            min={0}
            value={timeEstimate ?? ""}
            onChange={(e) =>
              setTimeEstimate(e.target.value ? Number(e.target.value) : null)
            }
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Frekvence">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={!recurring}
              onChange={() => setRecurring(false)}
            />
            Jednorázový (ad hoc)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={recurring}
              onChange={() => setRecurring(true)}
            />
            Opakující se každých
            <input
              type="number"
              min={1}
              value={frequencyDays}
              disabled={!recurring}
              onChange={(e) => setFrequencyDays(Number(e.target.value))}
              className="w-16 rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-950"
            />
            dní
          </label>
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Timeout claim (hodiny)">
          <input
            type="number"
            min={1}
            value={claimTimeout}
            onChange={(e) => setClaimTimeout(Number(e.target.value))}
            className={inputCls}
          />
        </Field>
        <Field label="Timeout execute (hodiny)">
          <input
            type="number"
            min={1}
            value={executeTimeout}
            onChange={(e) => setExecuteTimeout(Number(e.target.value))}
            className={inputCls}
          />
        </Field>
      </div>

      {mode.kind === "edit" && (
        <Field label="Stav">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Aktivní (generuje další instance)
          </label>
        </Field>
      )}

      {error && <div className="text-sm text-red-600">Chyba: {error}</div>}

      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={isPending || !name.trim()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {mode.kind === "create" ? "Vytvořit" : "Uložit"}
        </button>
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
        >
          Zrušit
        </button>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </label>
      {children}
    </div>
  );
}
