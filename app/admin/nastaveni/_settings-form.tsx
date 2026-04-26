"use client";

import { useState, useTransition } from "react";
import { updateAppSettingsAction } from "@/app/actions/settings";

type Settings = {
  hourlyRateCzk: number;
  screenTimeHourCostCzk: number;
  screenTimeMinGranularity: number;
  monthlyBonusCzk: number;
  defaultClaimTimeoutHours: number;
  defaultExecuteTimeoutHours: number;
};

export function SettingsForm({ initial }: { initial: Settings }) {
  const [s, setS] = useState<Settings>(initial);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await updateAppSettingsAction(s);
      if (!res.ok) setError(res.error);
      else setSavedAt(Date.now());
    });
  };

  const upd = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="mt-6 max-w-md space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <NumField
        label="Hodinová sazba (Kč/h)"
        value={s.hourlyRateCzk}
        onChange={(v) => upd("hourlyRateCzk", v)}
      />
      <NumField
        label="Cena za hodinu obrazovky (Kč)"
        value={s.screenTimeHourCostCzk}
        onChange={(v) => upd("screenTimeHourCostCzk", v)}
      />
      <NumField
        label="Granularita obrazovky (min)"
        value={s.screenTimeMinGranularity}
        onChange={(v) => upd("screenTimeMinGranularity", v)}
      />
      <NumField
        label="Měsíční bonus (Kč)"
        value={s.monthlyBonusCzk}
        onChange={(v) => upd("monthlyBonusCzk", v)}
      />
      <NumField
        label="Default timeout claim (h)"
        value={s.defaultClaimTimeoutHours}
        onChange={(v) => upd("defaultClaimTimeoutHours", v)}
      />
      <NumField
        label="Default timeout execute (h)"
        value={s.defaultExecuteTimeoutHours}
        onChange={(v) => upd("defaultExecuteTimeoutHours", v)}
      />

      {error && <div className="text-sm text-red-600">Chyba: {error}</div>}

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={submit}
          disabled={isPending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Uložit
        </button>
        {savedAt && (
          <span className="text-xs text-emerald-600">Uloženo</span>
        )}
      </div>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
      />
    </div>
  );
}
