"use client";

import { useState, useTransition } from "react";
import type { CheckStatus } from "@prisma/client";
import { Check, Hourglass, MessageCircle, Send, Timer, Undo2, X } from "lucide-react";
import { submitCheckAction } from "@/app/actions/checks";
import { dueDateToday, dueLabel, remaining } from "@/lib/deadline-pure";
import { formatTimePrague } from "./format";
import { SliderState, SwipeConfirm } from "./swipe-confirm";
import { useNow } from "./use-now";

export type CheckCardData = {
  id: string;
  name: string;
  status: CheckStatus;
  dueTime: string | null;
  note: string | null;
  submittedAt: string | null;
  reviewerName: string | null;
};

/** Daily check card (návrh 2, pen `CheckRow E · *`): due time on top, name, slider / state. */
export function CheckCard({ check, nowIso }: { check: CheckCardData; nowIso: string }) {
  const [status, setStatus] = useState<CheckStatus>(check.status);
  const [submittedAt, setSubmittedAt] = useState(check.submittedAt);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const now = useNow(nowIso);

  const submit = () => {
    setError(null);
    const prev = { status, submittedAt };
    setStatus("SUBMITTED");
    setSubmittedAt(new Date().toISOString());
    startTransition(async () => {
      const res = await submitCheckAction(check.id);
      if (!res.ok) {
        setStatus(prev.status);
        setSubmittedAt(prev.submittedAt);
        setError("Nepovedlo se odeslat. Zkus to znovu.");
      }
    });
  };

  const left = remaining(dueDateToday(check.dueTime, now), now);

  return (
    <article className="flex flex-col gap-3 rounded-tile border border-border bg-card px-[18px] pt-4 pb-[18px]">
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[11px] font-bold tracking-wider text-subtle">
          {dueLabel(check.dueTime)}
        </span>
        <span className="ml-auto">
          <Meta status={status} left={left} submittedAt={submittedAt} reviewer={check.reviewerName} />
        </span>
      </div>

      <h3 className="text-xl leading-tight font-bold tracking-tight">{check.name}</h3>

      {status === "REJECTED" && check.note && (
        <p className="flex gap-2.5 rounded-xl bg-danger-soft px-3.5 py-3 text-[15px]">
          <MessageCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <span>„{check.note}“</span>
        </p>
      )}

      {status === "PENDING" && (
        <SwipeConfirm label="Přejeď, až bude hotovo" onConfirm={submit} disabled={isPending} />
      )}
      {status === "REJECTED" && (
        <SwipeConfirm label="Přejeď, až to napravíš" onConfirm={submit} disabled={isPending} />
      )}
      {status === "SUBMITTED" && (
        <SliderState tone="warning" label="Čeká na schválení" icon={<Hourglass className="size-5" />} />
      )}
      {status === "APPROVED" && (
        <SliderState tone="success" label="Schváleno" icon={<Check className="size-[22px]" />} />
      )}
      {status === "MISSED" && (
        <SliderState tone="danger" label="Zmeškáno" icon={<X className="size-[22px]" />} />
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </article>
  );
}

function Meta({
  status,
  left,
  submittedAt,
  reviewer,
}: {
  status: CheckStatus;
  left: ReturnType<typeof remaining>;
  submittedAt: string | null;
  reviewer: string | null;
}) {
  const cls = "flex items-center gap-1.5 font-mono text-xs font-bold";
  switch (status) {
    case "PENDING":
      return (
        <span className={`${cls} ${left.soon ? "text-warning" : "text-muted-foreground"}`}>
          <Timer className="size-3.5" />
          {left.text}
        </span>
      );
    case "SUBMITTED":
      return submittedAt ? (
        <span className={`${cls} text-muted-foreground`}>
          <Send className="size-3.5" />
          odesláno {formatTimePrague(submittedAt)}
        </span>
      ) : null;
    case "APPROVED":
      return (
        <span className={`${cls} text-muted-foreground`}>
          <Check className="size-3.5" />
          {reviewer ? `schváleno · ${reviewer}` : "schváleno"}
        </span>
      );
    case "REJECTED":
      return (
        <span className={`${cls} text-destructive`}>
          <Undo2 className="size-3.5" />
          {reviewer ? `vrátil ${reviewer}` : "vráceno"}
        </span>
      );
    case "MISSED":
      return null;
  }
}
