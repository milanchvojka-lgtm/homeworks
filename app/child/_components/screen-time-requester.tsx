"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { requestScreenTimeAction } from "@/app/actions/screen-time";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Offer = { minutes: number; cost: number };

export function ScreenTimeRequester({
  offers,
  balance,
}: {
  offers: Offer[];
  balance: number;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    if (selected === null) return;
    setError(null);
    startTransition(async () => {
      const res = await requestScreenTimeAction(selected);
      if (!res.ok) {
        setError(
          res.error === "insufficient_credit"
            ? "Na to nemáš dost kreditu."
            : res.error === "invalid_minutes"
              ? "Neplatný výběr."
              : "Něco se nepovedlo.",
        );
        return;
      }
      setSubmitted(true);
    });
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-3">
          <CheckCircle2
            className="size-4 shrink-0"
            style={{ color: "var(--chart-1)" }}
          />
          <span className="text-sm">Žádost odeslaná. Čekej na schválení.</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {offers.map((o) => {
        const affordable = balance >= o.cost;
        const isSelected = selected === o.minutes;
        return (
          <Button
            key={o.minutes}
            variant={isSelected ? "default" : "outline"}
            onClick={() => setSelected(o.minutes)}
            disabled={!affordable || isPending}
            className="flex h-auto flex-col items-center py-3"
          >
            <span className="text-sm font-semibold">{o.minutes} min</span>
            <span className="mt-0.5 text-xs opacity-70">{o.cost} Kč</span>
          </Button>
        );
      })}
      {selected !== null && (
        <Button
          onClick={submit}
          disabled={isPending}
          className="col-span-3 mt-2 w-full"
        >
          Požádat
        </Button>
      )}
      {error && (
        <div className="col-span-3 text-xs text-destructive">{error}</div>
      )}
    </div>
  );
}
