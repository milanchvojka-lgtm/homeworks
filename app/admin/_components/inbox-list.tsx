"use client";

import { useState, useTransition } from "react";
import { approveCheckAction, rejectCheckAction } from "@/app/actions/checks";

type Item = {
  id: string;
  checkName: string;
  competencyName: string;
  submittedAt: string | null;
};

export function InboxList({ items }: { items: Item[] }) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const visible = items.filter((i) => !hidden.has(i.id));
  if (visible.length === 0) return null;

  const approve = (id: string) => {
    startTransition(async () => {
      const res = await approveCheckAction(id);
      if (res.ok) setHidden((h) => new Set(h).add(id));
    });
  };

  const reject = (id: string) => {
    startTransition(async () => {
      const res = await rejectCheckAction(id, note);
      if (res.ok) {
        setHidden((h) => new Set(h).add(id));
        setRejectingId(null);
        setNote("");
      }
    });
  };

  return (
    <ul className="space-y-2">
      {visible.map((i) => (
        <li
          key={i.id}
          className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="text-sm font-medium">{i.checkName}</div>
              <div className="text-xs text-zinc-500">
                {i.competencyName}
                {i.submittedAt
                  ? ` • ${new Date(i.submittedAt).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })}`
                  : ""}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => approve(i.id)}
                disabled={isPending}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
              >
                Schválit
              </button>
              <button
                onClick={() =>
                  setRejectingId(rejectingId === i.id ? null : i.id)
                }
                disabled={isPending}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300"
              >
                Vrátit
              </button>
            </div>
          </div>

          {rejectingId === i.id && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Důvod vrácení (volitelné)"
                className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                autoFocus
              />
              <button
                onClick={() => reject(i.id)}
                disabled={isPending}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
              >
                Vrátit
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
