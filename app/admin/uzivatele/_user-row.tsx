"use client";

import { useState, useTransition } from "react";
import { resetPinAction } from "@/app/actions/users";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    <li>
      <Card>
        <CardContent className="p-3">
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
                <div className="text-xs text-muted-foreground">
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
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={reset}
                  disabled={isPending}
                >
                  Potvrdit reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirming(false)}
                  disabled={isPending}
                >
                  Zrušit
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirming(true)}
              >
                Reset PINu
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </li>
  );
}
