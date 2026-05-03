"use client";

import { useEffect, useState, useTransition } from "react";
import type { TaskStatus } from "@prisma/client";
import { reportTaskDoneAction } from "@/app/actions/tasks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Item = {
  id: string;
  name: string;
  valueCzk: number;
  status: TaskStatus;
  executeDeadline: string | null;
  reviewNote: string | null;
};

export function MyTasksList({ items }: { items: Item[] }) {
  return (
    <div className="space-y-3">
      {items.map((i) => (
        <MyTaskCard key={i.id} item={i} />
      ))}
    </div>
  );
}

function MyTaskCard({ item }: { item: Item }) {
  const [optimisticStatus, setOptimisticStatus] = useState<TaskStatus>(
    item.status,
  );
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setOptimisticStatus("PENDING_REVIEW");
    startTransition(async () => {
      const res = await reportTaskDoneAction(item.id);
      if (!res.ok) setOptimisticStatus(item.status);
    });
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="text-sm font-medium">{item.name}</div>
            <div
              className="mt-0.5 text-sm font-bold tabular-nums"
              style={{ color: "var(--chart-1)" }}
            >
              {item.valueCzk} Kč
            </div>
          </div>
          <StatusBadge status={optimisticStatus} />
        </div>

        {optimisticStatus === "CLAIMED" && item.executeDeadline && (
          <Countdown deadline={item.executeDeadline} />
        )}

        {optimisticStatus === "REJECTED" && item.reviewNote && (
          <div className="mt-2 text-xs text-destructive">
            Vráceno: {item.reviewNote}
          </div>
        )}

        {optimisticStatus === "CLAIMED" && (
          <Button
            onClick={submit}
            disabled={isPending}
            className="mt-3 w-full"
          >
            Hotovo — nahlásit
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function Countdown({ deadline }: { deadline: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const remaining = new Date(deadline).getTime() - now;
  const overdue = remaining < 0;
  const abs = Math.abs(remaining);
  const hours = Math.floor(abs / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);

  return (
    <div
      className={`mt-2 text-xs tabular-nums ${overdue ? "text-destructive" : "text-muted-foreground"}`}
    >
      {overdue ? "Po termínu" : "Zbývá"} {hours}h {minutes}m
    </div>
  );
}

function StatusBadge({ status }: { status: TaskStatus }) {
  switch (status) {
    case "AVAILABLE":
      return <Badge variant="outline">Dostupné</Badge>;
    case "CLAIMED":
      return <Badge variant="secondary">Vzal jsi</Badge>;
    case "PENDING_REVIEW":
      return <Badge variant="secondary">⏳ Čeká</Badge>;
    case "DONE":
      return (
        <Badge
          style={{
            backgroundColor: "var(--chart-1)",
            color: "var(--background)",
          }}
        >
          ✅ Hotovo
        </Badge>
      );
    case "EXPIRED":
      return <Badge variant="outline">Vypršelo</Badge>;
    case "REJECTED":
      return <Badge variant="destructive">⚠️ Vráceno</Badge>;
  }
}
