"use client";

import { useState, useTransition } from "react";
import { updateAppSettingsAction } from "@/app/actions/settings";
import { computeMonthlyBonus } from "@/lib/bonus-graduated";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Settings = {
  hourlyRateCzk: number;
  screenTimeHourCostCzk: number;
  screenTimeMinGranularity: number;
  monthlyBonusCzk: number;
  monthlyBonusStepCzk: number;
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

  // Compute bonus preview rows
  const bonusRows = (() => {
    const rows: { misses: number; amount: number }[] = [];
    const maxRows = 5;
    let misses = 0;
    while (rows.length < maxRows) {
      const amount = computeMonthlyBonus({
        misses,
        fullCzk: s.monthlyBonusCzk,
        stepCzk: s.monthlyBonusStepCzk,
      });
      rows.push({ misses, amount });
      if (amount === 0) break;
      misses++;
    }
    return rows;
  })();

  const lastRow = bonusRows[bonusRows.length - 1];
  const showPlus =
    lastRow && lastRow.amount > 0 && bonusRows.length >= 5;

  return (
    <div className="mt-6 max-w-md space-y-6">
      {/* EKONOMIKA */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Ekonomika
        </p>
        <Card>
          <CardContent className="space-y-4 pt-5">
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
          </CardContent>
        </Card>
      </div>

      {/* MĚSÍČNÍ BONUS */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Měsíční bonus
        </p>
        <Card>
          <CardContent className="space-y-4 pt-5">
            <NumField
              label="Měsíční bonus (Kč)"
              value={s.monthlyBonusCzk}
              onChange={(v) => upd("monthlyBonusCzk", v)}
            />
            <NumField
              label="Krok ubývání bonusu (Kč)"
              value={s.monthlyBonusStepCzk}
              onChange={(v) => upd("monthlyBonusStepCzk", v)}
            />

            {/* Live preview */}
            <Card className="bg-secondary/40 border-0">
              <CardContent className="pt-4 pb-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Tabulka bonusu (live preview):
                </p>
                <ul className="space-y-0.5">
                  {bonusRows.map((row) => (
                    <li
                      key={row.misses}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {row.misses === bonusRows[bonusRows.length - 1]?.misses &&
                        row.amount === 0 &&
                        bonusRows.length > 1
                          ? `${row.misses}× a víc`
                          : `${row.misses}× zaváhání`}
                      </span>
                      <span
                        style={
                          row.amount > 0
                            ? { color: "var(--chart-1)" }
                            : undefined
                        }
                        className={row.amount === 0 ? "text-muted-foreground" : ""}
                      >
                        {row.amount} Kč
                      </span>
                    </li>
                  ))}
                  {showPlus && (
                    <li className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {(lastRow?.misses ?? 0) + 1}× a víc
                      </span>
                      <span className="text-muted-foreground">…</span>
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>

      {/* TIMEOUTY */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Timeouty
        </p>
        <Card>
          <CardContent className="space-y-4 pt-5">
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
          </CardContent>
        </Card>
      </div>

      {error && (
        <p className="text-sm text-destructive">Chyba: {error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={submit} disabled={isPending}>
          Uložit
        </Button>
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
    <div className="space-y-1">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
