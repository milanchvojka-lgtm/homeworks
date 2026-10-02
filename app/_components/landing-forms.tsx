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

export type LandingLang = "cs" | "en";

// D29: UI strings of the forms; server messages come from actions/landing.ts.
const COPY = {
  cs: {
    thanks: "Díky! Ozveme se, až bude místo.",
    email: "E-MAIL",
    placeholder: "vas@email.cz",
    sending: "Odesílám…",
    submit: "Chci být mezi prvními",
    noted: "Díky, zapsali jsme si to.",
    yes: "Ano, hned",
    no: "Spíš ne",
  },
  en: {
    thanks: "Thanks! We'll be in touch when there's a spot.",
    email: "EMAIL",
    placeholder: "you@email.com",
    sending: "Sending…",
    submit: "Count me in",
    noted: "Thanks, noted.",
    yes: "Yes, please",
    no: "Not really",
  },
} as const;

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

export function WaitlistForm({ lang = "cs" }: { lang?: LandingLang }) {
  const [state, action, pending] = useActionState(joinWaitlistAction, IDLE);
  const t = COPY[lang];

  if (state.status === "sent") {
    return (
      <p className="flex items-center gap-2 text-lg font-semibold text-success">
        <Check className="size-5" /> {t.thanks}
      </p>
    );
  }

  return (
    <form action={action} className="relative flex w-full max-w-[560px] flex-col gap-3 sm:flex-row sm:items-end">
      <Honeypot />
      <input type="hidden" name="lang" value={lang} />
      <label className="flex flex-1 flex-col gap-1.5 text-left">
        <span className="font-mono text-xs font-bold tracking-[0.1em] text-muted-foreground">{t.email}</span>
        <Input type="email" name="email" required placeholder={t.placeholder} autoComplete="email" />
      </label>
      <Button type="submit" disabled={pending} className="px-6">
        {pending ? t.sending : t.submit}
      </Button>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive sm:absolute sm:-bottom-7 sm:left-0">
          {state.message}
        </p>
      )}
    </form>
  );
}

export function QuizPoll({ lang = "cs" }: { lang?: LandingLang }) {
  const [state, action, pending] = useActionState(quizInterestAction, IDLE);
  const t = COPY[lang];

  if (state.status === "sent") {
    return (
      <p className="flex items-center gap-2 text-lg font-semibold text-success">
        <Check className="size-5" /> {t.noted}
      </p>
    );
  }

  return (
    <form action={action} className="relative flex flex-col gap-3">
      <Honeypot />
      <input type="hidden" name="lang" value={lang} />
      <div className="flex gap-3">
        <Button type="submit" name="answer" value="yes" variant="outline" disabled={pending} className="h-12 flex-1 font-semibold">
          {t.yes}
        </Button>
        <Button type="submit" name="answer" value="no" variant="outline" disabled={pending} className="h-12 flex-1 font-semibold">
          {t.no}
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
