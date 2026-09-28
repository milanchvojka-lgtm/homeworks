"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Flame, ListChecks, MonitorPlay, Sun, type LucideIcon } from "lucide-react";
import { completeWelcomeAction } from "@/app/actions/welcome";
import { Button } from "@/components/ui/button";

type Step = { Icon: LucideIcon; title: string; text: string; sample?: React.ReactNode };

/** Pen `WelcomeStep` ×4: pink outline icon, one sentence, one button; Přeskočit finishes too. */
export function WelcomeFlow({
  competency,
  offer,
  bonusCzk,
}: {
  competency: string | null;
  offer: { name: string; valueCzk: number; minutes: number | null } | null;
  bonusCzk: number;
}) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [isPending, startTransition] = useTransition();

  const steps: Step[] = [
    {
      Icon: Sun,
      title: competency ? `Tenhle týden máš ${competency}` : "Tvoje povinnosti",
      text: competency
        ? "Každý den ji dáš do pořádku a přejedeš, že je hotovo."
        : "Kompetenci ti rodiče přidělí. Pak ji každý den dáš do pořádku a přejedeš, že je hotovo.",
    },
    {
      Icon: ListChecks,
      title: "Vydělej si navíc",
      text: "Když máš povinnosti hotové, bereš si placené úkoly.",
      sample: offer && (
        <div className="flex items-center gap-3 rounded-tile border border-border bg-card px-[18px] py-4">
          <span className="flex flex-1 flex-col gap-0.5 text-left">
            <span className="text-lg font-bold">{offer.name}</span>
            {offer.minutes && (
              <span className="font-mono text-[11px] font-bold tracking-wider text-subtle">
                ~{offer.minutes} MIN
              </span>
            )}
          </span>
          <span className="font-mono text-xl font-bold text-highlight">{offer.valueCzk} Kč</span>
        </div>
      ),
    },
    {
      Icon: MonitorPlay,
      title: "Screen time, nebo peníze",
      text: "Za vydělané si koupíš screen time, nebo ti to v neděli vyplatíme.",
    },
    {
      Icon: Flame,
      title: "Nic nevynechej",
      text: "Když nic nevynecháš, roste ti řada a měsíční bonus. První týden je na zkoušku, nic neztratíš.",
      sample: bonusCzk > 0 && (
        <div className="flex flex-col items-center gap-0.5 rounded-tile border border-border bg-card px-[18px] py-[18px]">
          <span className="font-mono text-[34px] font-bold text-highlight">+{bonusCzk} Kč</span>
          <span className="text-[15px] font-semibold text-muted-foreground">do začátku, jsou tvoje</span>
        </div>
      ),
    },
  ];
  const step = steps[i];
  const last = i === steps.length - 1;

  const finish = () =>
    startTransition(async () => {
      const res = await completeWelcomeAction();
      if (res.ok) router.replace(res.next);
    });

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-background pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(2.125rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-1.5" aria-label={`Krok ${i + 1} ze ${steps.length}`}>
          {steps.map((_, d) => (
            <span
              key={d}
              className={`h-2 rounded-full ${d === i ? "w-5 bg-highlight" : d < i ? "w-2 bg-subtle" : "w-2 bg-border"}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={finish}
          disabled={isPending}
          className="flex h-11 items-center px-1 text-base font-semibold text-muted-foreground"
        >
          Přeskočit
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-3.5 px-4 text-center">
        <step.Icon className="size-14 text-highlight" />
        <span className="font-mono text-[11px] font-bold tracking-[0.14em] text-subtle">
          KROK {i + 1} ZE {steps.length}
        </span>
        <h1 className="text-[28px] leading-tight font-bold tracking-tight">{step.title}</h1>
        <p className="text-[17px] leading-snug text-muted-foreground">{step.text}</p>
        {step.sample && <div className="w-full pt-2.5">{step.sample}</div>}
      </div>

      <div className="px-4">
        <Button className="w-full" disabled={isPending} onClick={() => (last ? finish() : setI(i + 1))}>
          {last ? "Jdeme na to" : "Další"}
        </Button>
      </div>
    </main>
  );
}
