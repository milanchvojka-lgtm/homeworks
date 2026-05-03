"use client";

import { useState, useTransition } from "react";
import {
  createStreakMilestoneAction,
  updateStreakMilestoneAction,
  deleteStreakMilestoneAction,
} from "@/app/actions/settings";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Milestone = {
  id: string;
  days: number;
  rewardCzk: number;
  trophyName: string;
  emoji: string;
  sortOrder: number;
};

type MilestoneFormValues = {
  days: number;
  rewardCzk: number;
  trophyName: string;
  emoji: string;
  sortOrder: number;
};

const DEFAULT_VALUES: MilestoneFormValues = {
  days: 7,
  rewardCzk: 0,
  trophyName: "",
  emoji: "🏆",
  sortOrder: 0,
};

function mapError(error: string): string {
  if (error === "duplicate_days") return "Milník s tímhle počtem dnů už existuje.";
  if (error === "invalid_days") return "Počet dnů musí být větší než 0.";
  if (error === "invalid_reward") return "Odměna nesmí být záporná.";
  if (error === "empty_name") return "Název trofeje je povinný.";
  if (error === "empty_emoji") return "Emoji je povinné.";
  return `Chyba: ${error}`;
}

function MilestoneDialog({
  open,
  onOpenChange,
  title,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initial: MilestoneFormValues;
  onSubmit: (values: MilestoneFormValues) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [values, setValues] = useState<MilestoneFormValues>(initial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Reset form when dialog opens with new initial values
  const handleOpenChange = (o: boolean) => {
    if (o) {
      setValues(initial);
      setError(null);
    }
    onOpenChange(o);
  };

  const upd = <K extends keyof MilestoneFormValues>(k: K, v: MilestoneFormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await onSubmit(values);
      if (!res.ok) {
        setError(mapError(res.error));
      } else {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Počet dnů
              </Label>
              <Input
                type="number"
                min={1}
                value={values.days}
                onChange={(e) => upd("days", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Odměna (Kč)
              </Label>
              <Input
                type="number"
                min={0}
                value={values.rewardCzk}
                onChange={(e) => upd("rewardCzk", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Název trofeje
            </Label>
            <Input
              type="text"
              value={values.trophyName}
              onChange={(e) => upd("trophyName", e.target.value)}
              placeholder="např. Týdenní šampion"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Emoji
              </Label>
              <Input
                type="text"
                value={values.emoji}
                onChange={(e) => upd("emoji", e.target.value)}
                placeholder="🏆"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Pořadí (sortOrder)
              </Label>
              <Input
                type="number"
                min={0}
                value={values.sortOrder}
                onChange={(e) => upd("sortOrder", Number(e.target.value))}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Zrušit
          </Button>
          <Button onClick={submit} disabled={isPending}>
            Uložit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteConfirmDialog({
  open,
  onOpenChange,
  milestone,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: Milestone | null;
  onConfirm: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  const confirm = () => {
    startTransition(async () => {
      await onConfirm();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Smazat milník?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground py-2">
          Smazat milník{" "}
          <span className="font-medium text-foreground">
            {milestone?.emoji} {milestone?.trophyName}
          </span>
          ? Tím se smažou i všechny získané trofeje tohoto typu.
        </p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Zrušit
          </Button>
          <Button variant="destructive" onClick={confirm} disabled={isPending}>
            Smazat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MilestonesForm({ milestones }: { milestones: Milestone[] }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Milestone | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Milestone | null>(null);

  const sorted = [...milestones].sort((a, b) =>
    a.sortOrder !== b.sortOrder ? a.sortOrder - b.sortOrder : a.days - b.days
  );

  return (
    <>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Milníky streaku
        </p>
        <Card>
          <CardContent className="pt-5">
            {sorted.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                Žádné milníky zatím neexistují.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {sorted.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 py-2.5">
                    <span className="text-xl leading-none">{m.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{m.trophyName}</p>
                      <p className="text-xs text-muted-foreground">{m.days} dnů</p>
                    </div>
                    <span
                      className="text-sm font-medium tabular-nums"
                      style={m.rewardCzk > 0 ? { color: "var(--chart-1)" } : undefined}
                    >
                      {m.rewardCzk > 0 ? `+${m.rewardCzk} Kč` : "—"}
                    </span>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => setEditTarget(m)}
                      >
                        Upravit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(m)}
                      >
                        Smazat
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddOpen(true)}
              >
                + Přidat milník
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add dialog */}
      <MilestoneDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Přidat milník"
        initial={DEFAULT_VALUES}
        onSubmit={(values) => createStreakMilestoneAction(values)}
      />

      {/* Edit dialog */}
      <MilestoneDialog
        open={editTarget !== null}
        onOpenChange={(o) => { if (!o) setEditTarget(null); }}
        title="Upravit milník"
        initial={
          editTarget
            ? {
                days: editTarget.days,
                rewardCzk: editTarget.rewardCzk,
                trophyName: editTarget.trophyName,
                emoji: editTarget.emoji,
                sortOrder: editTarget.sortOrder,
              }
            : DEFAULT_VALUES
        }
        onSubmit={(values) =>
          editTarget
            ? updateStreakMilestoneAction(editTarget.id, values)
            : Promise.resolve({ ok: false as const, error: "no_target" })
        }
      />

      {/* Delete confirm dialog */}
      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        milestone={deleteTarget}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteStreakMilestoneAction(deleteTarget.id);
          }
        }}
      />
    </>
  );
}
