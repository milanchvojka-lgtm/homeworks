"use client";

import { useState, useTransition } from "react";
import type { CheckStatus, TimeOfDay } from "@prisma/client";
import { submitCheckAction } from "@/app/actions/checks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Instance = {
  id: string;
  name: string;
  timeOfDay: TimeOfDay;
  status: CheckStatus;
  note: string | null;
};

const SECTIONS: { key: TimeOfDay; label: string }[] = [
  { key: "MORNING", label: "Ráno" },
  { key: "EVENING", label: "Večer" },
  { key: "ANYTIME", label: "Kdykoliv" },
];

export function TodayChecks({ instances }: { instances: Instance[] }) {
  const grouped: Record<TimeOfDay, Instance[]> = {
    MORNING: [],
    EVENING: [],
    ANYTIME: [],
  };
  for (const i of instances) grouped[i.timeOfDay].push(i);

  const activeSections = SECTIONS.filter((s) => grouped[s.key].length > 0);

  return (
    <Card>
      <CardContent className="pt-0 px-0">
        {activeSections.map((s, idx) => (
          <section key={s.key}>
            {idx > 0 && <Separator />}
            <div className="px-5 pt-4 pb-1">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {s.label}
              </div>
            </div>
            <ul className="divide-y">
              {grouped[s.key].map((i) => (
                <CheckRow key={i.id} instance={i} />
              ))}
            </ul>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}

function CheckRow({ instance }: { instance: Instance }) {
  const [optimisticStatus, setOptimisticStatus] = useState<CheckStatus>(
    instance.status,
  );
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setOptimisticStatus("SUBMITTED");
    startTransition(async () => {
      const res = await submitCheckAction(instance.id);
      if (!res.ok) setOptimisticStatus(instance.status);
    });
  };

  const canSubmit =
    optimisticStatus === "PENDING" || optimisticStatus === "REJECTED";

  const isDone = optimisticStatus === "APPROVED";
  const isMissed = optimisticStatus === "MISSED";

  return (
    <li
      className={`flex items-center justify-between gap-3 px-5 py-3 ${
        isDone ? "opacity-60" : isMissed ? "opacity-60" : ""
      }`}
    >
      <div className="flex-1">
        <div
          className={`text-sm font-medium ${isDone ? "line-through text-muted-foreground" : ""}`}
        >
          {instance.name}
        </div>
        {optimisticStatus === "REJECTED" && instance.note ? (
          <div className="mt-0.5 text-xs text-destructive">
            Vráceno: {instance.note}
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <StatusBadge status={optimisticStatus} />
        {canSubmit && (
          <Button
            variant="default"
            size="sm"
            onClick={submit}
            disabled={isPending}
            className="text-xs"
          >
            Hotovo
          </Button>
        )}
      </div>
    </li>
  );
}

function StatusBadge({ status }: { status: CheckStatus }) {
  switch (status) {
    case "PENDING":
      return null;
    case "SUBMITTED":
      return <Badge variant="secondary">⏳ Čeká</Badge>;
    case "APPROVED":
      return (
        <Badge
          style={{
            backgroundColor: "var(--chart-1)",
            color: "var(--background)",
            borderColor: "var(--chart-1)",
          }}
        >
          ✅ OK
        </Badge>
      );
    case "REJECTED":
      return <Badge variant="destructive">⚠️ Vráceno</Badge>;
    case "MISSED":
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Zmeškáno
        </Badge>
      );
  }
}
