import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  MILAN_INBOX,
  MILAN_COMPETENCIES,
  MILAN_TASKS,
  MILAN_USERS,
  MILAN_PAYOUTS,
  MILAN_SETTINGS,
  MILESTONES,
} from "@/app/showcase/_data";

const limeStyle = { color: "var(--chart-1)" };

function SectionHeader({ label, route }: { label: string; route: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border pb-1">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </h2>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
        {route}
      </span>
    </div>
  );
}

function Avatar({
  name,
  color,
  size = "sm",
}: {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "sm" ? "size-7 text-xs" : size === "md" ? "size-9 text-sm" : "size-12 text-lg";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${sizeClass}`}
      style={{ backgroundColor: color }}
    >
      {name.charAt(0)}
    </div>
  );
}

function kindLabel(kind: "check" | "task" | "screen") {
  if (kind === "check") return "Check";
  if (kind === "task") return "Úkol";
  return "Obrazovka";
}

function kindVariant(
  kind: "check" | "task" | "screen",
): "default" | "secondary" | "outline" {
  if (kind === "check") return "default";
  if (kind === "task") return "secondary";
  return "outline";
}

export default function MilanShowcase() {
  return (
    <main className="mx-auto max-w-2xl space-y-12 px-4 py-8 pb-24">
      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <header className="flex items-center gap-4">
        <Avatar name="Milan" color="#2563eb" size="lg" />
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Pohled rodiče
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Milan</h1>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Admin · Pondělí 3. 5. 2026
          </div>
        </div>
      </header>

      {/* ── INBOX ───────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader label="Inbox" route="app/admin/inbox" />
        <div className="space-y-3">
          {MILAN_INBOX.map((group) => (
            <Card key={group.userId}>
              <CardContent className="px-4 pt-3 pb-3">
                {/* Group header */}
                <div className="mb-3 flex items-center gap-2">
                  <Avatar name={group.userName} color={group.avatarColor} size="sm" />
                  <span className="text-sm font-semibold">{group.userName}</span>
                  <Badge variant="outline" className="ml-auto text-[10px] tabular-nums">
                    {group.items.length}
                  </Badge>
                </div>
                <ul className="divide-y divide-border -mx-4 px-4">
                  {group.items.map((item) => (
                    <li key={item.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{item.title}</span>
                            <Badge
                              variant={kindVariant(item.kind)}
                              className="text-[9px] uppercase tracking-wider"
                            >
                              {kindLabel(item.kind)}
                            </Badge>
                            {item.amountCzk && (
                              <span className="text-xs font-semibold" style={limeStyle}>
                                {item.amountCzk} Kč
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.subtitle} · {item.submittedAt}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button variant="default" size="sm" disabled>
                            Schválit
                          </Button>
                          <Button variant="outline" size="sm" disabled>
                            Vrátit
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── KOMPETENCE ──────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader label="Kompetence" route="app/admin/kompetence" />
        <div className="grid gap-3 sm:grid-cols-3">
          {MILAN_COMPETENCIES.map((comp) => (
            <Card key={comp.id}>
              <CardContent className="pt-4 pb-4 space-y-3">
                <div className="text-lg font-bold">{comp.name}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {comp.checksCount} denní cheky
                </div>
                <div className="flex items-center gap-2">
                  <Avatar
                    name={comp.assignedTo.name}
                    color={comp.assignedTo.avatarColor}
                    size="sm"
                  />
                  <span className="text-xs text-muted-foreground">
                    {comp.assignedTo.name} · tento týden
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── ÚKOLY ───────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader label="Úkoly" route="app/admin/ukoly" />
        <Card>
          <CardContent className="px-0 pt-0 pb-0">
            <ul className="divide-y divide-border">
              {MILAN_TASKS.map((task, i) => (
                <li
                  key={task.id}
                  className={`flex items-center justify-between gap-3 px-4 py-3 ${
                    !task.active ? "opacity-50" : ""
                  } ${i === 0 ? "rounded-t-xl" : ""} ${
                    i === MILAN_TASKS.length - 1 ? "rounded-b-xl" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{task.name}</span>
                      <Badge
                        variant={task.active ? "default" : "outline"}
                        className="text-[9px] uppercase tracking-wider"
                      >
                        {task.active ? "aktivní" : "neaktivní"}
                      </Badge>
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {task.frequency} · {task.durationMin} min
                    </div>
                  </div>
                  <span className="text-sm font-bold tabular-nums" style={limeStyle}>
                    {task.rewardCzk} Kč
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* ── UŽIVATELÉ ───────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader label="Uživatelé" route="app/admin/uzivatele" />
        <Card>
          <CardContent className="px-0 pt-0 pb-0">
            <ul className="divide-y divide-border">
              {MILAN_USERS.map((user, i) => (
                <li
                  key={user.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i === 0 ? "rounded-t-xl" : ""
                  } ${i === MILAN_USERS.length - 1 ? "rounded-b-xl" : ""}`}
                >
                  <Avatar name={user.name} color={user.avatarColor} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{user.name}</span>
                      <Badge
                        variant={user.role === "ADMIN" ? "secondary" : "outline"}
                        className="text-[9px] uppercase tracking-wider"
                      >
                        {user.role === "ADMIN" ? "Admin" : "Dítě"}
                      </Badge>
                      {user.rotationOrder && (
                        <span className="text-[10px] text-muted-foreground">
                          pořadí {user.rotationOrder}
                        </span>
                      )}
                    </div>
                    {user.monthlyAllowanceCzk && (
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Kapesné {user.monthlyAllowanceCzk} Kč / měsíc
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* ── VÝPLATY ─────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader label="Výplaty" route="app/admin/vyplaty" />
        <div className="space-y-3">
          {MILAN_PAYOUTS.map((week) => (
            <Card key={week.id}>
              <CardContent className="pt-3 pb-3">
                <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {week.weekLabel}
                </div>
                <ul className="divide-y divide-border -mx-4 px-4">
                  {week.payouts.map((p, j) => (
                    <li
                      key={j}
                      className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar name={p.userName} color={p.avatarColor} size="sm" />
                        <span className="text-sm">{p.userName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold tabular-nums" style={limeStyle}>
                          {p.amountCzk} Kč
                        </span>
                        <Badge
                          variant={p.paid ? "default" : "outline"}
                          className="text-[9px] uppercase tracking-wider"
                        >
                          {p.paid ? "Vyplaceno" : "Čeká"}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── NASTAVENÍ ───────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader label="Nastavení" route="app/admin/nastaveni" />

        {/* Settings card */}
        <Card>
          <CardContent className="pt-4 pb-4 space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Systémové hodnoty
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Hodinová sazba", value: `${MILAN_SETTINGS.hourlyRateCzk} Kč/h` },
                { label: "Obrazovka / hodina", value: `${MILAN_SETTINGS.screenTimeHourCzk} Kč` },
                { label: "Granularita obrazovky", value: `${MILAN_SETTINGS.screenTimeGranularityMin} min` },
                { label: "Bonus plný", value: `${MILAN_SETTINGS.monthlyBonusFullCzk} Kč` },
                { label: "Bonus krok", value: `${MILAN_SETTINGS.monthlyBonusStepCzk} Kč` },
                { label: "Claim timeout", value: `${MILAN_SETTINGS.defaultClaimTimeoutH} h` },
                { label: "Execute timeout", value: `${MILAN_SETTINGS.defaultExecuteTimeoutH} h` },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-0.5">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {label}
                  </div>
                  <div className="text-sm font-semibold tabular-nums">{value}</div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Bonus table */}
            <div>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Bonus tabulka
              </div>
              <div className="rounded-lg border border-border overflow-hidden text-xs">
                <div className="grid grid-cols-2 bg-muted/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Zaváhání</span>
                  <span className="text-right">Bonus</span>
                </div>
                {[0, 1, 2, 3, 4].map((miss) => {
                  const bonus = Math.max(
                    0,
                    MILAN_SETTINGS.monthlyBonusFullCzk - miss * MILAN_SETTINGS.monthlyBonusStepCzk,
                  );
                  return (
                    <div
                      key={miss}
                      className="grid grid-cols-2 border-t border-border px-3 py-1.5"
                    >
                      <span>{miss}×</span>
                      <span className="text-right font-semibold tabular-nums" style={bonus > 0 ? limeStyle : undefined}>
                        {bonus > 0 ? `${bonus} Kč` : "0 Kč"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardContent className="px-0 pt-0 pb-0">
            <div className="px-4 pt-3 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Milníky (trofeje)
            </div>
            <ul className="divide-y divide-border">
              {MILESTONES.map((ms, i) => (
                <li
                  key={ms.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i === MILESTONES.length - 1 ? "rounded-b-xl" : ""
                  }`}
                >
                  <span className="text-lg shrink-0">{ms.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{ms.trophyName}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {ms.days} dnů
                    </div>
                  </div>
                  {ms.rewardCzk > 0 ? (
                    <span className="text-sm font-bold tabular-nums" style={limeStyle}>
                      +{ms.rewardCzk} Kč
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">bez bonusu</span>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
