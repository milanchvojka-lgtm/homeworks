"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTaskAction, updateTaskAction } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

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
    <Card className="mt-6 max-w-xl">
      <CardContent className="space-y-4 pt-5">
        <Field label="Název">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field label="Popis (volitelné)">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Hodnota (Kč)">
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
              <Input
                type="number"
                min={1}
                value={frequencyDays}
                disabled={!recurring}
                onChange={(e) => setFrequencyDays(Number(e.target.value))}
                className="w-16"
              />
              dní
            </label>
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Timeout claim (hodiny)">
            <Input
              type="number"
              min={1}
              value={claimTimeout}
              onChange={(e) => setClaimTimeout(Number(e.target.value))}
            />
          </Field>
          <Field label="Timeout execute (hodiny)">
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

        {error && <div className="text-sm text-destructive">Chyba: {error}</div>}

        <div className="flex gap-2">
          <Button
            onClick={submit}
            disabled={isPending || !name.trim()}
          >
            {mode.kind === "create" ? "Vytvořit" : "Uložit"}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Zrušit
          </Button>
        </div>
      </CardContent>
    </Card>
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
    <div className="space-y-1">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
