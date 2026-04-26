"use client";

import { useState, useTransition } from "react";
import { resetPinAction } from "@/app/actions/users";

type User = {
  id: string;
  name: string;
  role: "ADMIN" | "CHILD";
  avatarColor: string;
  rotationOrder: number | null;
  monthlyAllowanceCzk: number;
};

export function UserRow({ user }: { user: User }) {
  const [confirming, setConfirming] = useState(false);
  const [tempPin, setTempPin] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    startTransition(async () => {
      const res = await resetPinAction(user.id);
      if (res.ok) {
        setTempPin(res.tempPin);
        setConfirming(false);
      }
    });
  };

  return (
    <li className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: user.avatarColor }}
          >
            {user.name[0]}
          </div>
          <div>
            <div className="text-sm font-medium">{user.name}</div>
            <div className="text-xs text-zinc-500">
              {user.role === "ADMIN" ? "Rodič" : "Dítě"}
              {user.role === "CHILD" && user.rotationOrder
                ? ` • pořadí ${user.rotationOrder}`
                : ""}
            </div>
          </div>
        </div>

        {tempPin ? (
          <div className="text-xs text-emerald-700 dark:text-emerald-400">
            Nový PIN: <span className="font-mono font-semibold">{tempPin}</span>
          </div>
        ) : confirming ? (
          <div className="flex gap-2">
            <button
              onClick={reset}
              disabled={isPending}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
            >
              Potvrdit reset
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={isPending}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-700"
            >
              Zrušit
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Reset PINu
          </button>
        )}
      </div>
    </li>
  );
}
