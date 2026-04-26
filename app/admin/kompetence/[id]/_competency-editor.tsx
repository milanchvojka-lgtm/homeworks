"use client";

import { useState, useTransition } from "react";
import type { TimeOfDay } from "@prisma/client";
import {
  createDailyCheckAction,
  deleteDailyCheckAction,
  updateCompetencyAction,
  updateDailyCheckAction,
} from "@/app/actions/competencies";

type Competency = {
  id: string;
  name: string;
  description: string | null;
};

type Check = {
  id: string;
  name: string;
  timeOfDay: TimeOfDay;
};

const TIME_LABELS: Record<TimeOfDay, string> = {
  MORNING: "Ráno",
  EVENING: "Večer",
  ANYTIME: "Kdykoliv",
};

export function CompetencyEditor({
  competency,
  checks: initialChecks,
}: {
  competency: Competency;
  checks: Check[];
}) {
  const [name, setName] = useState(competency.name);
  const [description, setDescription] = useState(competency.description ?? "");
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const saveMeta = () => {
    startTransition(async () => {
      await updateCompetencyAction(competency.id, {
        name,
        description: description || null,
      });
      setSavedAt(Date.now());
    });
  };

  return (
    <div className="mt-3">
      <h1 className="text-2xl font-semibold">{competency.name}</h1>

      <div className="mt-6 space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Název
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Popis
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={saveMeta}
            disabled={isPending}
            className="rounded-lg bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Uložit
          </button>
          {savedAt && (
            <span className="text-xs text-emerald-600">Uloženo</span>
          )}
        </div>
      </div>

      <h2 className="mt-8 text-lg font-semibold">Denní checky</h2>
      <ChecksList competencyId={competency.id} initial={initialChecks} />
    </div>
  );
}

function ChecksList({
  competencyId,
  initial,
}: {
  competencyId: string;
  initial: Check[];
}) {
  const [checks, setChecks] = useState<Check[]>(initial);
  const [newName, setNewName] = useState("");
  const [newTime, setNewTime] = useState<TimeOfDay>("MORNING");
  const [isPending, startTransition] = useTransition();

  const add = () => {
    if (!newName.trim()) return;
    startTransition(async () => {
      await createDailyCheckAction(competencyId, {
        name: newName,
        timeOfDay: newTime,
      });
      setChecks((prev) => [
        ...prev,
        { id: `tmp-${Date.now()}`, name: newName.trim(), timeOfDay: newTime },
      ]);
      setNewName("");
    });
  };

  const update = (id: string, patch: Partial<Check>) => {
    setChecks((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  };

  const persist = (c: Check) => {
    if (c.id.startsWith("tmp-")) return;
    startTransition(async () => {
      await updateDailyCheckAction(c.id, {
        name: c.name,
        timeOfDay: c.timeOfDay,
      });
    });
  };

  const remove = (id: string) => {
    setChecks((prev) => prev.filter((c) => c.id !== id));
    if (id.startsWith("tmp-")) return;
    startTransition(async () => {
      await deleteDailyCheckAction(id);
    });
  };

  return (
    <div className="mt-3 space-y-2">
      {checks.map((c) => (
        <div
          key={c.id}
          className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <input
            value={c.name}
            onChange={(e) => update(c.id, { name: e.target.value })}
            onBlur={() => persist(c)}
            className="flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm focus:border-zinc-300 dark:focus:border-zinc-700"
          />
          <select
            value={c.timeOfDay}
            onChange={(e) => {
              const next = { ...c, timeOfDay: e.target.value as TimeOfDay };
              update(c.id, { timeOfDay: next.timeOfDay });
              persist(next);
            }}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-950"
          >
            {(["MORNING", "EVENING", "ANYTIME"] as TimeOfDay[]).map((t) => (
              <option key={t} value={t}>
                {TIME_LABELS[t]}
              </option>
            ))}
          </select>
          <button
            onClick={() => remove(c.id)}
            disabled={isPending}
            className="rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-950/30"
          >
            Smazat
          </button>
        </div>
      ))}

      <div className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nový denní check"
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <select
          value={newTime}
          onChange={(e) => setNewTime(e.target.value as TimeOfDay)}
          className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-950"
        >
          {(["MORNING", "EVENING", "ANYTIME"] as TimeOfDay[]).map((t) => (
            <option key={t} value={t}>
              {TIME_LABELS[t]}
            </option>
          ))}
        </select>
        <button
          onClick={add}
          disabled={isPending || !newName.trim()}
          className="rounded-lg bg-zinc-900 px-3 py-1 text-xs font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Přidat
        </button>
      </div>
    </div>
  );
}
