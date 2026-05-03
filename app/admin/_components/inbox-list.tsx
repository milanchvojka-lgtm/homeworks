"use client";

import { useState, useTransition } from "react";
import { approveCheckAction, rejectCheckAction } from "@/app/actions/checks";
import { approveTaskAction, rejectTaskAction } from "@/app/actions/tasks";
import {
  approveScreenTimeAction,
  rejectScreenTimeAction,
} from "@/app/actions/screen-time";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Item = {
  id: string;
  kind: "check" | "task" | "screen";
  title: string;
  subtitle: string;
  submittedAt: string | null;
};

export function InboxList({ items }: { items: Item[] }) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const visible = items.filter((i) => !hidden.has(i.id));
  if (visible.length === 0) return null;

  const approve = (item: Item) => {
    startTransition(async () => {
      const res =
        item.kind === "check"
          ? await approveCheckAction(item.id)
          : item.kind === "task"
            ? await approveTaskAction(item.id)
            : await approveScreenTimeAction(item.id);
      if (res.ok) setHidden((h) => new Set(h).add(item.id));
    });
  };

  const reject = (item: Item) => {
    startTransition(async () => {
      const res =
        item.kind === "check"
          ? await rejectCheckAction(item.id, note)
          : item.kind === "task"
            ? await rejectTaskAction(item.id, note)
            : await rejectScreenTimeAction(item.id);
      if (res.ok) {
        setHidden((h) => new Set(h).add(item.id));
        setRejectingId(null);
        setNote("");
      }
    });
  };

  return (
    <ul className="divide-y -mx-6 px-6">
      {visible.map((i) => (
        <li key={i.id} className="py-3 first:pt-0 last:pb-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="text-sm font-medium">{i.title}</div>
              <div className="text-xs text-muted-foreground">
                {i.subtitle}
                {i.submittedAt
                  ? ` • ${new Date(i.submittedAt).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })}`
                  : ""}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => approve(i)}
                disabled={isPending}
              >
                Schválit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setRejectingId(rejectingId === i.id ? null : i.id)
                }
                disabled={isPending}
              >
                Vrátit
              </Button>
            </div>
          </div>

          {rejectingId === i.id && (
            <div className="mt-3 flex gap-2">
              <Input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Důvod vrácení (volitelné)"
                className="flex-1"
                autoFocus
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => reject(i)}
                disabled={isPending}
              >
                Vrátit
              </Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
