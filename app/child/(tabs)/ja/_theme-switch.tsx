"use client";

import { useState, useTransition } from "react";
import { Moon, Smartphone, Sun } from "lucide-react";
import { setThemeAction } from "@/app/actions/theme";
import type { ThemePref } from "@/lib/theme";

const OPTIONS: { value: ThemePref; label: string; Icon: typeof Sun }[] = [
  { value: "system", label: "Automaticky", Icon: Smartphone },
  { value: "light", label: "Světlý", Icon: Sun },
  { value: "dark", label: "Tmavý", Icon: Moon },
];

/** Vzhled: Automaticky / Světlý / Tmavý (D17 update). */
export function ThemeSwitch({ current }: { current: ThemePref }) {
  const [value, setValue] = useState(current);
  const [isPending, startTransition] = useTransition();

  const choose = (next: ThemePref) => {
    setValue(next);
    startTransition(async () => {
      await setThemeAction(next);
    });
  };

  return (
    <section className="flex flex-col gap-3 rounded-tile border border-border bg-card p-[18px]">
      <span className="font-mono text-[11px] font-bold tracking-wider text-subtle uppercase">
        Vzhled
      </span>
      <div role="radiogroup" aria-label="Vzhled" className="grid grid-cols-3 gap-1 rounded-full bg-muted p-1">
        {OPTIONS.map(({ value: v, label, Icon }) => {
          const active = v === value;
          return (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={isPending}
              onClick={() => choose(v)}
              className={`flex h-11 items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition-colors ${
                active ? "bg-card text-foreground ring-1 ring-border" : "text-muted-foreground"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
