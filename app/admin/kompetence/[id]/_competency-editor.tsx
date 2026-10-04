"use client";

import { useState, useTransition } from "react";
import type { TimeOfDay } from "@prisma/client";
import {
  createDailyCheckAction,
  deleteDailyCheckAction,
  updateCompetencyAction,
  updateDailyCheckAction,
} from "@/app/actions/competencies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type Competency = {
  id: string;
  name: string;
  description: string | null;
};

type Check = {
  id: string;
  name: string;
  /** D33: what the end state means, shown to the child under the name. */
  description: string | null;
  timeOfDay: TimeOfDay;
  dueTime: string | null;
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
    <div className="flex flex-col gap-3">
      <Card>
        <CardContent className="space-y-3 pt-4">
          <div className="space-y-1">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Název
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Popis
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={saveMeta}
              disabled={isPending}
              size="sm"
            >
              Uložit
            </Button>
            {savedAt && (
              <span className="text-xs text-emerald-600">Uloženo</span>
            )}
          </div>
        </CardContent>
      </Card>

      <h2 className="mt-4 font-mono text-xs font-bold tracking-[0.12em] uppercase">Denní checky</h2>
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
  const [newDue, setNewDue] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  const add = () => {
    if (!newName.trim()) return;
    startTransition(async () => {
      await createDailyCheckAction(competencyId, {
        name: newName,
        description: newDescription || null,
        timeOfDay: newTime,
        dueTime: newDue || null,
      });
      setChecks((prev) => [
        ...prev,
        {
          id: `tmp-${Date.now()}`,
          name: newName.trim(),
          description: newDescription.trim() || null,
          timeOfDay: newTime,
          dueTime: newDue || null,
        },
      ]);
      setNewName("");
      setNewDue("");
      setNewDescription("");
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
        description: c.description,
        timeOfDay: c.timeOfDay,
        dueTime: c.dueTime,
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
        <Card key={c.id}>
          <CardContent className="flex flex-col gap-2 p-3">
            <div className="flex items-center gap-2">
              <Input
                value={c.name}
                onChange={(e) => update(c.id, { name: e.target.value })}
                onBlur={() => persist(c)}
                className="flex-1 border-transparent bg-transparent focus-visible:border-input"
              />
              <select
                value={c.timeOfDay}
                onChange={(e) => {
                  const next = { ...c, timeOfDay: e.target.value as TimeOfDay };
                  update(c.id, { timeOfDay: next.timeOfDay });
                  persist(next);
                }}
                className="rounded-md border border-input bg-background px-2 py-1 text-xs"
              >
                {(["MORNING", "EVENING", "ANYTIME"] as TimeOfDay[]).map((t) => (
                  <option key={t} value={t}>
                    {TIME_LABELS[t]}
                  </option>
                ))}
              </select>
              <input
                type="time"
                aria-label="Termín (do kolika)"
                title="Termín (do kolika) – volitelné"
                value={c.dueTime ?? ""}
                onChange={(e) => update(c.id, { dueTime: e.target.value || null })}
                onBlur={(e) => persist({ ...c, dueTime: e.target.value || null })}
                className="rounded-md border border-input bg-background px-2 py-1 text-xs"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(c.id)}
                disabled={isPending}
                className="text-destructive hover:text-destructive"
              >
                Smazat
              </Button>
            </div>
            <Textarea
              value={c.description ?? ""}
              onChange={(e) => update(c.id, { description: e.target.value || null })}
              onBlur={(e) => persist({ ...c, description: e.target.value || null })}
              placeholder="Co to znamená (volitelné)"
              aria-label="Co to znamená"
              rows={2}
            />
          </CardContent>
        </Card>
      ))}

      <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border p-3">
        <div className="flex items-center gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nový denní check"
            className="flex-1"
          />
          <select
            value={newTime}
            onChange={(e) => setNewTime(e.target.value as TimeOfDay)}
            className="rounded-md border border-input bg-background px-2 py-1 text-xs"
          >
            {(["MORNING", "EVENING", "ANYTIME"] as TimeOfDay[]).map((t) => (
              <option key={t} value={t}>
                {TIME_LABELS[t]}
              </option>
            ))}
          </select>
          <input
            type="time"
            aria-label="Termín (do kolika)"
            title="Termín (do kolika) – volitelné"
            value={newDue}
            onChange={(e) => setNewDue(e.target.value)}
            className="rounded-md border border-input bg-background px-2 py-1 text-xs"
          />
          <Button
            size="sm"
            onClick={add}
            disabled={isPending || !newName.trim()}
          >
            Přidat
          </Button>
        </div>
        <Textarea
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Co to znamená (volitelné)"
          aria-label="Co to znamená"
          rows={2}
        />
      </div>
    </div>
  );
}
