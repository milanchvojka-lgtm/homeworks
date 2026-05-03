// Mockup pro brainstorm — žádný backend, jen vizuál.
// Cesta: /mockup/streak
// Smazat až po schválení designu.

type Tier = {
  name: string;
  emoji: string;
  min: number;
  next?: number;
  gradient: string;
  ring: string;
};

const TIERS: Tier[] = [
  {
    name: "BRONZE",
    emoji: "🥉",
    min: 0,
    next: 7,
    gradient: "from-amber-700/20 via-amber-500/10 to-amber-300/5",
    ring: "ring-amber-500/40",
  },
  {
    name: "SILVER",
    emoji: "🥈",
    min: 7,
    next: 30,
    gradient: "from-zinc-400/30 via-zinc-300/15 to-slate-200/10",
    ring: "ring-zinc-400/50",
  },
  {
    name: "GOLD",
    emoji: "🥇",
    min: 30,
    next: 60,
    gradient: "from-yellow-500/30 via-amber-400/15 to-yellow-200/5",
    ring: "ring-yellow-500/50",
  },
  {
    name: "PLATINUM",
    emoji: "💎",
    min: 60,
    next: 100,
    gradient: "from-cyan-400/30 via-sky-300/15 to-blue-200/10",
    ring: "ring-cyan-400/50",
  },
  {
    name: "DIAMOND",
    emoji: "💠",
    min: 100,
    next: 365,
    gradient: "from-violet-500/30 via-fuchsia-400/15 to-pink-300/10",
    ring: "ring-violet-500/50",
  },
  {
    name: "MASTER",
    emoji: "👑",
    min: 365,
    gradient: "from-rose-500/40 via-orange-400/25 to-yellow-300/15",
    ring: "ring-rose-500/60",
  },
];

function tierFromStreak(days: number): Tier {
  return [...TIERS].reverse().find((t) => days >= t.min) ?? TIERS[0];
}

// ─── Komponenta 1: Tier rank ──────────────────────────────────────────────
function TierBanner({
  streak,
  monthlyBonusCzk,
  monthlyMisses,
  fullBonusCzk = 200,
  stepCzk = 50,
  broken = false,
}: {
  streak: number;
  monthlyBonusCzk: number;
  monthlyMisses: number;
  fullBonusCzk?: number;
  stepCzk?: number;
  broken?: boolean;
}) {
  const tier = tierFromStreak(streak);
  const progress = tier.next
    ? Math.min(1, (streak - tier.min) / (tier.next - tier.min))
    : 1;
  const remaining = tier.next ? tier.next - streak : 0;
  const nextTierName = tier.next ? TIERS[TIERS.indexOf(tier) + 1]?.name : null;

  return (
    <div
      className={`rounded-3xl bg-gradient-to-br ${tier.gradient} border border-zinc-200 p-6 dark:border-zinc-800`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-3xl font-bold">
          <span>{broken ? "💔" : "🔥"}</span>
          <span>{streak}</span>
          <span className="text-base font-medium text-zinc-600 dark:text-zinc-400">
            {streak === 1 ? "den v řadě" : streak < 5 ? "dny v řadě" : "dnů v řadě"}
          </span>
        </div>
      </div>

      <div className="mb-5 flex items-center gap-4">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm ring-4 dark:bg-zinc-900 ${tier.ring}`}
        >
          {tier.emoji}
        </div>
        <div>
          <div className="text-xs font-medium tracking-widest text-zinc-500 dark:text-zinc-400">
            TIER
          </div>
          <div className="text-2xl font-extrabold tracking-tight">
            {tier.name}
          </div>
        </div>
      </div>

      {tier.next && (
        <div className="mb-5">
          <div className="mb-1.5 flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
            <span>{streak} / {tier.next}</span>
            <span>
              za {remaining} {remaining === 1 ? "den" : remaining < 5 ? "dny" : "dnů"} → {nextTierName}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-zinc-700 to-zinc-900 dark:from-zinc-300 dark:to-white"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl bg-white/60 px-4 py-3 backdrop-blur dark:bg-zinc-900/60">
        <div className="text-sm">
          <div className="font-medium">💰 Bonus tento měsíc</div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            {monthlyMisses === 0
              ? "bez zaváhání"
              : `${monthlyMisses}× zaváhání (−${monthlyMisses * stepCzk} Kč)`}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold tabular-nums">
            {monthlyBonusCzk} Kč
          </div>
          <div className="text-[10px] text-zinc-500">z {fullBonusCzk} Kč</div>
        </div>
      </div>
    </div>
  );
}

// ─── Komponenta 2: Trophy room ────────────────────────────────────────────
type Trophy = {
  emoji: string;
  name: string;
  days: number;
  rewardCzk: number;
  earnedAt?: string;
};

const TROPHIES: Trophy[] = [
  { emoji: "🥉", name: "Iron Will", days: 7, rewardCzk: 0 },
  { emoji: "🥈", name: "Steady", days: 14, rewardCzk: 0 },
  { emoji: "🥇", name: "Flawless Month", days: 30, rewardCzk: 100 },
  { emoji: "💎", name: "Unbreakable", days: 60, rewardCzk: 200 },
  { emoji: "👑", name: "Centurion", days: 100, rewardCzk: 500 },
  { emoji: "⚡", name: "Legend", days: 365, rewardCzk: 2000 },
];

function TrophyRoom({
  currentStreak,
  longestStreak,
  brokenStreaks,
  earnedAtMap,
}: {
  currentStreak: number;
  longestStreak: number;
  brokenStreaks: number;
  earnedAtMap: Record<number, string>;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-xl font-bold tracking-tight">Trofeje</h2>
        <div className="text-right text-xs text-zinc-500">
          <div>nejdelší: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{longestStreak} dnů</span></div>
          <div>rozbité řady: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{brokenStreaks}</span></div>
        </div>
      </div>

      <ul className="space-y-2">
        {TROPHIES.map((t) => {
          const earned = !!earnedAtMap[t.days];
          const isCurrent = !earned && currentStreak < t.days;
          const isNext =
            isCurrent &&
            !TROPHIES.some(
              (tt) => tt.days < t.days && tt.days > currentStreak,
            );
          const remaining = t.days - currentStreak;

          return (
            <li
              key={t.days}
              className={`flex items-center gap-3 rounded-xl border p-3 ${
                earned
                  ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20"
                  : isNext
                    ? "border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/20"
                    : "border-zinc-200 bg-zinc-50 opacity-70 dark:border-zinc-800 dark:bg-zinc-900/40"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl ${
                  earned
                    ? "bg-white shadow-sm dark:bg-zinc-800"
                    : "bg-zinc-200 grayscale dark:bg-zinc-800"
                }`}
              >
                {t.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-xs text-zinc-500">{t.days} dnů</span>
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  {earned ? (
                    <>
                      ✓ získáno {earnedAtMap[t.days]}
                      {t.rewardCzk > 0 && (
                        <span className="ml-1 font-medium text-emerald-700 dark:text-emerald-400">
                          +{t.rewardCzk} Kč
                        </span>
                      )}
                    </>
                  ) : isNext ? (
                    <>
                      ⏳ za {remaining} {remaining === 1 ? "den" : remaining < 5 ? "dny" : "dnů"}
                      {t.rewardCzk > 0 && (
                        <span className="ml-1 text-zinc-500">→ +{t.rewardCzk} Kč</span>
                      )}
                    </>
                  ) : (
                    <>
                      🔒 {t.rewardCzk > 0 ? `+${t.rewardCzk} Kč` : "badge"}
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Komponenta 3: GitHub-style grid ──────────────────────────────────────
type DayCell = "approved" | "missed" | "rejected" | "future" | "empty";

function generateMockGrid(weeks = 12): DayCell[][] {
  const today = new Date();
  const todayDow = (today.getDay() + 6) % 7; // Po=0
  const grid: DayCell[][] = [];
  for (let w = 0; w < weeks; w++) {
    const row: DayCell[] = [];
    for (let d = 0; d < 7; d++) {
      const daysAgo = (weeks - 1 - w) * 7 + (todayDow - d);
      if (daysAgo < 0) row.push("future");
      else if (daysAgo === 0) row.push("approved");
      else {
        // pseudo-random ale deterministicky podle indexu
        const seed = (w * 7 + d) % 17;
        if (seed === 3) row.push("missed");
        else if (seed === 11) row.push("rejected");
        else row.push("approved");
      }
    }
    grid.push(row);
  }
  return grid;
}

function StreakGrid() {
  const grid = generateMockGrid(12);
  const days = ["P", "Ú", "S", "Č", "P", "S", "N"];

  const cellClass = (c: DayCell): string => {
    switch (c) {
      case "approved":
        return "bg-emerald-500 dark:bg-emerald-400";
      case "missed":
        return "bg-zinc-300 dark:bg-zinc-700";
      case "rejected":
        return "bg-rose-400 dark:bg-rose-500";
      case "future":
        return "border border-dashed border-zinc-200 dark:border-zinc-800";
      default:
        return "bg-zinc-100 dark:bg-zinc-900";
    }
  };

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-xl font-bold tracking-tight">Posledních 12 týdnů</h2>
        <div className="flex items-center gap-3 text-[10px] text-zinc-500">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500"/>OK</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-zinc-300"/>missed</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-rose-400"/>rejected</span>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col gap-1.5 pt-0.5 text-[10px] text-zinc-400">
          {days.map((d, i) => (
            <div key={i} className="h-4 leading-4">{d}</div>
          ))}
        </div>
        <div className="flex flex-1 gap-1.5">
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-1 flex-col gap-1.5">
              {week.map((cell, di) => (
                <div
                  key={di}
                  className={`h-4 w-full rounded-sm ${cellClass(cell)}`}
                  title={`týden ${wi + 1}, den ${di + 1}: ${cell}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Stránka: galerie všech stavů ─────────────────────────────────────────
export default function MockupPage() {
  const earnedAtMap: Record<number, string> = {
    7: "12. 4. 2026",
    14: "19. 4. 2026",
    30: "5. 5. 2026",
  };

  return (
    <main className="mx-auto max-w-2xl space-y-12 p-6 pb-20">
      <header className="space-y-1">
        <div className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          Mockup
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Streak gamifikace
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Statický náhled tří komponent. Žádný backend, jen vizuál pro
          rozhodnutí o směru.
        </p>
      </header>

      {/* Tier rank — různé stavy */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
          A · Tier rank (různé stavy)
        </h2>

        <div>
          <div className="mb-2 text-xs text-zinc-500">Bronze · 3denní streak, plný bonus</div>
          <TierBanner streak={3} monthlyBonusCzk={200} monthlyMisses={0} />
        </div>

        <div>
          <div className="mb-2 text-xs text-zinc-500">Silver · 17denní streak, 1× zaváhání tento měsíc</div>
          <TierBanner streak={17} monthlyBonusCzk={150} monthlyMisses={1} />
        </div>

        <div>
          <div className="mb-2 text-xs text-zinc-500">Gold · 47denní streak, plný bonus</div>
          <TierBanner streak={47} monthlyBonusCzk={200} monthlyMisses={0} />
        </div>

        <div>
          <div className="mb-2 text-xs text-zinc-500">Diamond · 134denní streak, 2× zaváhání</div>
          <TierBanner streak={134} monthlyBonusCzk={100} monthlyMisses={2} />
        </div>

        <div>
          <div className="mb-2 text-xs text-zinc-500">Streak právě padl · Bronze, 4× zaváhání = bonus 0</div>
          <TierBanner streak={0} monthlyBonusCzk={0} monthlyMisses={4} broken />
        </div>
      </section>

      {/* Trophy room */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
          B · Trophy room
        </h2>
        <TrophyRoom
          currentStreak={47}
          longestStreak={89}
          brokenStreaks={3}
          earnedAtMap={earnedAtMap}
        />
      </section>

      {/* GitHub grid */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
          C · Streak grid (k schválení / vyřazení)
        </h2>
        <StreakGrid />
      </section>
    </main>
  );
}
