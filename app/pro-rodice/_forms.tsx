"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  joinWaitlistAction,
  quizInterestAction,
  type LandingFormState,
} from "@/app/actions/landing";

const IDLE: LandingFormState = { status: "idle" };

// Hidden from people, tempting for bots (see actions/landing.ts).
function Honeypot() {
  return (
    <input
      type="text"
      name="web"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden
      className="absolute -left-[9999px] h-0 w-0 opacity-0"
    />
  );
}

export function WaitlistForm() {
  const [state, action, pending] = useActionState(joinWaitlistAction, IDLE);

  if (state.status === "sent") {
    return (
      <p className="flex items-center gap-2 text-lg font-semibold text-success">
        <Check className="size-5" /> Díky! Ozveme se, až bude místo.
      </p>
    );
  }

  return (
    <form action={action} className="relative flex w-full max-w-[560px] flex-col gap-3 sm:flex-row sm:items-end">
      <Honeypot />
      <label className="flex flex-1 flex-col gap-1.5 text-left">
        <span className="font-mono text-xs font-bold tracking-[0.1em] text-muted-foreground">E-MAIL</span>
        <Input type="email" name="email" required placeholder="vas@email.cz" autoComplete="email" />
      </label>
      <Button type="submit" disabled={pending} className="px-6">
        {pending ? "Odesílám…" : "Chci být mezi prvními"}
      </Button>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive sm:absolute sm:-bottom-7 sm:left-0">
          {state.message}
        </p>
      )}
    </form>
  );
}

export function QuizPoll() {
  const [state, action, pending] = useActionState(quizInterestAction, IDLE);

  if (state.status === "sent") {
    return (
      <p className="flex items-center gap-2 text-lg font-semibold text-success">
        <Check className="size-5" /> Díky, zapsali jsme si to.
      </p>
    );
  }

  return (
    <form action={action} className="relative flex flex-col gap-3">
      <Honeypot />
      <div className="flex gap-3">
        <Button type="submit" name="answer" value="yes" variant="outline" disabled={pending} className="h-12 flex-1 font-semibold">
          Ano, hned
        </Button>
        <Button type="submit" name="answer" value="no" variant="outline" disabled={pending} className="h-12 flex-1 font-semibold">
          Spíš ne
        </Button>
      </div>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
    </form>
  );
}
