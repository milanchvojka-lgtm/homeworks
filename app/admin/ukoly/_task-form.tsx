"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTaskAction, updateTaskAction } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="flex flex-col gap-4">
        <Field label="Název">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field label="Popis (volitelné)">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </Field>

        <div className="grid grid-cols-2 items-end gap-3">
          <Field label="Odměna (Kč)">
            <Input
              type="number"
              min={0}
              value={valueCzk}
              onChange={(e) => setValueCzk(Number(e.target.value))}
            />
          </Field>
          <Field label="Odhad času (min, volitelné)">
            <Input
              type="number"
              min={0}
              value={timeEstimate ?? ""}
              onChange={(e) =>
                setTimeEstimate(e.target.value ? Number(e.target.value) : null)
              }
            />
          </Field>
        </div>

        <Field label="Opakování">
          <div className="flex h-11 gap-1 rounded-full bg-muted p-1">
            {[
              { value: false, label: "Jednorázový" },
              { value: true, label: "Opakovaný" },
            ].map((o) => (
              <button
                key={o.label}
                type="button"
                aria-pressed={recurring === o.value}
                onClick={() => setRecurring(o.value)}
                className={`flex-1 rounded-full text-[15px] ${
                  recurring === o.value
                    ? "border border-border bg-card font-semibold"
                    : "font-medium text-muted-foreground"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          {recurring && (
            <label className="mt-2 flex items-center gap-2 text-[15px]">
              Každých
              <Input
                type="number"
                min={1}
                value={frequencyDays}
                onChange={(e) => setFrequencyDays(Number(e.target.value))}
                className="w-20"
              />
              dní
            </label>
          )}
        </Field>

        <div className="grid grid-cols-2 items-end gap-3">
          <Field label="Na převzetí (hod)">
            <Input
              type="number"
              min={1}
              value={claimTimeout}
              onChange={(e) => setClaimTimeout(Number(e.target.value))}
            />
          </Field>
          <Field label="Na splnění (hod)">
            <Input
              type="number"
              min={1}
              value={executeTimeout}
              onChange={(e) => setExecuteTimeout(Number(e.target.value))}
            />
          </Field>
        </div>

        {mode.kind === "edit" && (
          <Field label="Stav">
            <label className="flex items-center gap-2 text-[15px]">
              <input
                className="size-5 accent-foreground"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Aktivní (generuje další instance)
            </label>
          </Field>
        )}

        {error && <div className="text-sm text-destructive">Chyba: {error}</div>}

        <div className="mt-2 flex flex-col gap-2.5">
          <Button
            className="w-full"
            onClick={submit}
            disabled={isPending || !name.trim()}
          >
            {mode.kind === "create" ? "Vytvořit úkol" : "Uložit úkol"}
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full"
            onClick={() => router.back()}
          >
            Zrušit
          </Button>
        </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="font-mono text-[11px] font-bold tracking-wider text-subtle uppercase">
        {label}
      </Label>
      {children}
    </div>
  );
}
