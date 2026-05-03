import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LabIndex() {
  const vibes = [
    {
      href: "/lab/a",
      label: "A · Minimal",
      sub: "Editorial, monochrom, jeden akcent",
      vibes: "Linear / Apple / Framer",
    },
    {
      href: "/lab/b",
      label: "B · Playful",
      sub: "Gradient, glow, sport feel",
      vibes: "Strava / Apple Fitness / Duolingo",
    },
    {
      href: "/lab/c",
      label: "C · Gaming",
      sub: "Dark-first, neon, monospace",
      vibes: "Discord / Vercel / Riot",
    },
    {
      href: "/lab/d",
      label: "D · Refined B",
      sub: "B s amber akcentem, shadcn primitiva, čistší typo",
      vibes: "B + shadcn polish",
    },
  ];

  return (
    <main className="mx-auto max-w-2xl space-y-8 p-6 pb-20">
      <header className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Design Lab
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Tři vibes obrazovky „Dnes"
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stejný obsah, tři různé design directions. Vyber jednu — podle ní
            postavíme celou appku.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <div className="grid gap-3">
        {vibes.map((v) => (
          <Link
            key={v.href}
            href={v.href}
            className="group rounded-2xl border bg-card p-5 transition hover:border-foreground/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold">{v.label}</div>
                <div className="text-sm text-muted-foreground">{v.sub}</div>
                <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground/70">
                  {v.vibes}
                </div>
              </div>
              <span className="text-2xl text-muted-foreground/40 group-hover:translate-x-1 group-hover:text-foreground transition">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-dashed p-4 text-xs text-muted-foreground">
        Tip: každá stránka má v rohu přepínač light/dark. Vyzkoušej obojí, než
        se rozhodneš.
      </div>
    </main>
  );
}
