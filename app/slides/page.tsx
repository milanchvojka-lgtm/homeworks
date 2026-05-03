"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StreakBanner } from "@/components/streak/streak-banner";

// ---------------------------------------------------------------------------
// Slide container
// ---------------------------------------------------------------------------

function SlideContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full max-h-[80vh] w-full max-w-5xl flex-col items-center justify-center text-center">
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Individual slides
// ---------------------------------------------------------------------------

function TitleSlide() {
  return (
    <SlideContainer>
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
        Interní demo · 4. května 2026
      </p>
      <h1 className="text-8xl font-bold tracking-tight">Homeworks</h1>
      <p className="mt-5 text-2xl text-muted-foreground">
        Rodinný systém pro domácí úkoly
      </p>
      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[11px] text-muted-foreground/50">
        Milan Chvojka · milan@2fresh.cz
      </p>
    </SlideContainer>
  );
}

function ProblemSlide() {
  return (
    <SlideContainer>
      <h2 className="mb-10 text-5xl font-bold tracking-tight">
        Před tím to byl chaos.
      </h2>
      <div className="space-y-4 text-left">
        {[
          "Magnetická tabule",
          "Tabulka v Excelu",
          'WhatsApp výzvy „uklidíš pokoj?"',
        ].map((item) => (
          <p
            key={item}
            className="flex items-center gap-3 text-2xl text-muted-foreground"
          >
            <span className="text-destructive">✗</span>
            <span className="line-through">{item}</span>
          </p>
        ))}
      </div>
      <p
        className="mt-10 text-3xl font-bold"
        style={{ color: "var(--chart-1)" }}
      >
        To už ne.
      </p>
    </SlideContainer>
  );
}

function WhatSlide() {
  const cards = [
    {
      icon: "🧹",
      title: "Denní povinnosti",
      desc: "Kompetence, checky ráno/večer, schválení rodičem",
    },
    {
      icon: "🎯",
      title: "Pool úkolů",
      desc: "Extra úkoly v rotační frontě — kdo dřív přijde",
    },
    {
      icon: "💰",
      title: "Kredit + obrazovka",
      desc: "Vše v Kč — holka si koupí čas nebo dostane kapesné",
    },
  ];

  return (
    <SlideContainer>
      <h2 className="mb-10 text-5xl font-bold tracking-tight">Tři věci.</h2>
      <div className="grid w-full grid-cols-3 gap-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardContent className="flex flex-col items-center gap-3 pt-6 pb-6 text-center">
              <span className="text-4xl">{c.icon}</span>
              <p className="text-lg font-bold">{c.title}</p>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </SlideContainer>
  );
}

function StreakSlide() {
  const bonus = {
    misses: 0,
    currentBonusCzk: 200,
    fullBonusCzk: 200,
    stepCzk: 50,
    lostOn: null,
  };

  return (
    <SlideContainer>
      <p className="mb-4 text-lg text-muted-foreground">
        Aby holky chtěly otevřít appku každý den.
      </p>
      <div className="w-full max-w-sm text-left">
        <StreakBanner currentStreak={47} longestStreak={89} bonus={bonus} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Streak · Tier rank · Trofeje · Měsíční bonus
      </p>
    </SlideContainer>
  );
}

function ComparisonSlide() {
  const rows = [
    {
      label: "Cena/měsíc",
      commercial: "5–10 USD",
      ours: "0 Kč",
      oursLime: true,
    },
    {
      label: "Region dat",
      commercial: "US cloud",
      ours: "EU (Frankfurt)",
      oursLime: true,
    },
    {
      label: "UI pro 11–15letý",
      commercial: "dětské",
      ours: "fitness/sport vibe",
      oursLime: true,
    },
    {
      label: "Streak pro teens",
      commercial: "✗",
      ours: "✓",
      oursLime: true,
    },
    {
      label: "Screen time vs kredit",
      commercial: "✗",
      ours: "✓",
      oursLime: true,
    },
  ];

  return (
    <SlideContainer>
      <h2 className="mb-8 text-5xl font-bold tracking-tight">
        Proč ne appka ze storu.
      </h2>
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-4 pb-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 pr-4 text-xs font-medium uppercase tracking-widest text-muted-foreground"></th>
                <th className="pb-3 pr-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Komerční appky
                </th>
                <th className="pb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Homeworks
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-border/40 last:border-0">
                  <td className="py-3 pr-4 text-muted-foreground">{row.label}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{row.commercial}</td>
                  <td
                    className="py-3 font-semibold"
                    style={row.oursLime ? { color: "var(--chart-1)" } : undefined}
                  >
                    {row.ours}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </SlideContainer>
  );
}

function MethodologySlide() {
  const steps = [
    { label: "PRD", caption: "Co a proč" },
    { label: "DECISIONS", caption: "Architektonická rozhodnutí" },
    { label: "PLAN", caption: "Bite-sized milestony" },
    { label: "DESIGN LAB", caption: "Vizuální vibes" },
    { label: "CODE", caption: "AI jako disciplinovaný junior" },
  ];

  return (
    <SlideContainer>
      <h2 className="text-5xl font-bold tracking-tight">
        Specification-oriented development.
      </h2>
      <p className="mt-3 text-xl text-muted-foreground">
        Ne vibe coding. Plán předchází kódu.
      </p>

      <div className="mt-10 flex w-full items-start justify-center gap-2">
        {steps.map((step, idx) => (
          <div key={step.label} className="flex items-start gap-2">
            <div className="flex flex-col items-center gap-2">
              <Badge
                variant="secondary"
                className="whitespace-nowrap px-3 py-1.5 text-xs font-bold uppercase tracking-widest"
              >
                {step.label}
              </Badge>
              <p className="max-w-[90px] text-center text-[10px] text-muted-foreground leading-tight">
                {step.caption}
              </p>
            </div>
            {idx < steps.length - 1 && (
              <span className="mt-1.5 text-muted-foreground/40">→</span>
            )}
          </div>
        ))}
      </div>

      <p className="mt-10 max-w-xl text-center text-xs italic text-muted-foreground/70">
        Bez plánu AI generuje kód, který v čase shnije. S plánem AI exekuuje,
        nehádá.
      </p>
    </SlideContainer>
  );
}

function StackSlide() {
  const items = [
    "Next.js 16",
    "React 19",
    "Tailwind 4",
    "shadcn/ui",
    "TypeScript",
    "Prisma",
    "Postgres",
    "Supabase",
    "GitHub Actions",
    "Resend",
    "Vercel",
    "Vitest",
  ];

  return (
    <SlideContainer>
      <h2 className="mb-8 text-5xl font-bold tracking-tight">Stack.</h2>
      <div className="flex max-w-2xl flex-wrap justify-center gap-2">
        {items.map((item) => (
          <Badge key={item} variant="secondary" className="px-3 py-1.5 text-sm">
            {item}
          </Badge>
        ))}
      </div>
      <p className="mt-8 text-sm font-semibold" style={{ color: "var(--chart-1)" }}>
        0 Kč/měsíc TCO · EU data
      </p>
    </SlideContainer>
  );
}

function NumbersSlide() {
  const stats = [
    { value: "21", label: "commitů" },
    { value: "87 / 87", label: "testů zelených" },
    { value: "~4 h", label: "v1.1 sprint" },
    { value: "0 Kč", label: "/ měsíc" },
  ];

  return (
    <SlideContainer>
      <h2 className="mb-10 text-5xl font-bold tracking-tight">Tahle session.</h2>
      <div className="grid w-full max-w-2xl grid-cols-2 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <span
                className="text-6xl font-bold tabular-nums leading-none"
                style={{ color: "var(--chart-1)" }}
              >
                {s.value}
              </span>
              <span className="mt-3 text-sm text-muted-foreground">{s.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        Spec → AI → ostrý systém pro 5 lidí.
      </p>
    </SlideContainer>
  );
}

function DemoSlide() {
  return (
    <SlideContainer>
      <p className="mb-6 text-lg text-muted-foreground">Pojďme to vidět.</p>
      <div
        className="font-mono text-8xl font-bold tracking-tight"
        style={{ color: "var(--chart-1)" }}
      >
        /showcase
      </div>
      <p className="mt-6 text-lg text-muted-foreground">
        Klikací průchod aplikací. Dítě i rodič.
      </p>
    </SlideContainer>
  );
}

function ThanksSlide() {
  return (
    <SlideContainer>
      <h2 className="text-8xl font-bold tracking-tight">Díky.</h2>
      <p className="mt-6 text-2xl text-muted-foreground">Otázky?</p>
      <p className="mt-10 font-mono text-sm text-muted-foreground/60">
        Milan Chvojka · milan@2fresh.cz
      </p>
    </SlideContainer>
  );
}

// ---------------------------------------------------------------------------
// Slide registry
// ---------------------------------------------------------------------------

const SLIDES = [
  TitleSlide,
  ProblemSlide,
  WhatSlide,
  StreakSlide,
  ComparisonSlide,
  MethodologySlide,
  StackSlide,
  NumbersSlide,
  DemoSlide,
  ThanksSlide,
];

// ---------------------------------------------------------------------------
// Main deck
// ---------------------------------------------------------------------------

export default function SlideDeck() {
  const [i, setI] = useState(0);

  const next = () => setI((x) => Math.min(x + 1, SLIDES.length - 1));
  const prev = () => setI((x) => Math.max(x - 1, 0));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      else if (e.key === "ArrowLeft" || e.key === "Backspace") prev();
      else if (e.key === "Escape") (window.location.href = "/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const Slide = SLIDES[i];

  return (
    <main className="flex h-full w-full items-center justify-center px-12 py-12">
      {/* Slide content with fade-in animation */}
      <div
        key={i}
        className="flex h-full w-full items-center justify-center"
        style={{ animation: "slideIn 280ms ease-out" }}
      >
        <Slide />
      </div>

      {/* Prev button */}
      <button
        onClick={prev}
        disabled={i === 0}
        aria-label="Předchozí slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-20"
      >
        <ChevronLeft className="size-6" />
      </button>

      {/* Next button */}
      <button
        onClick={next}
        disabled={i === SLIDES.length - 1}
        aria-label="Další slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-20"
      >
        <ChevronRight className="size-6" />
      </button>

      {/* Slide counter */}
      <div className="absolute bottom-6 right-6 font-mono text-xs text-muted-foreground tabular-nums">
        {i + 1} / {SLIDES.length}
      </div>

      {/* Esc hint */}
      <div className="absolute bottom-6 left-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">
        ← → · ESC pro index
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
