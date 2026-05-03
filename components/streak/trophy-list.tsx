import { Separator } from "@/components/ui/separator";

type TrophyItem = {
  milestone: {
    id: string;
    days: number;
    rewardCzk: number;
    trophyName: string;
    emoji: string;
  };
  status: "earned" | "current" | "locked";
  earnedAt?: Date;
  rewardPaidAt?: Date | null;
  /** For "current" trophies — days remaining to reach this milestone. */
  remainingDays?: number;
};

type TrophyListProps = {
  trophies: TrophyItem[];
};

function pluralizeDays(days: number): string {
  if (days === 1) return "den";
  if (days >= 2 && days <= 4) return "dny";
  return "dnů";
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

export function TrophyList({ trophies }: TrophyListProps) {
  return (
    <ul className="divide-y divide-border">
      {trophies.map((t, i) => (
        <li key={t.milestone.id}>
          {i > 0 && <Separator className="hidden" />}
          <TrophyRow trophy={t} />
        </li>
      ))}
    </ul>
  );
}

function TrophyRow({ trophy }: { trophy: TrophyItem }) {
  const { milestone, status, earnedAt, rewardPaidAt, remainingDays } = trophy;

  if (status === "earned") {
    return (
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card shadow-sm ring-1 ring-border text-xl">
          {milestone.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold">{milestone.trophyName}</span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              {milestone.days} {pluralizeDays(milestone.days)}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span>získáno {earnedAt ? formatDate(earnedAt) : "—"}</span>
            {milestone.rewardCzk > 0 && (
              <span
                className="font-semibold"
                style={{ color: "var(--chart-1)" }}
              >
                +{milestone.rewardCzk} Kč
                {rewardPaidAt === null && (
                  <span className="ml-1 text-muted-foreground font-normal">(čeká)</span>
                )}
              </span>
            )}
          </div>
        </div>
        <span className="text-base" aria-label="splněno">✅</span>
      </div>
    );
  }

  if (status === "current") {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-none"
        style={{ borderLeft: "3px solid var(--chart-1)" }}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-xl">
          {milestone.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold">{milestone.trophyName}</span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              {milestone.days} {pluralizeDays(milestone.days)}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              za{" "}
              <span className="font-medium" style={{ color: "var(--chart-1)" }}>
                {remainingDays} {pluralizeDays(remainingDays ?? 0)}
              </span>
            </span>
            {milestone.rewardCzk > 0 && (
              <span className="text-muted-foreground">
                → +{milestone.rewardCzk} Kč
              </span>
            )}
          </div>
        </div>
        <span className="text-base" aria-label="v progresuu">⏳</span>
      </div>
    );
  }

  // locked
  return (
    <div className="flex items-center gap-3 px-4 py-3 opacity-50">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-xl grayscale">
        {milestone.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-muted-foreground">
            {milestone.trophyName}
          </span>
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            {milestone.days} {pluralizeDays(milestone.days)}
          </span>
        </div>
        {milestone.rewardCzk > 0 && (
          <div className="mt-0.5 text-xs text-muted-foreground">
            +{milestone.rewardCzk} Kč
          </div>
        )}
      </div>
      <span className="text-base" aria-label="zamčeno">🔒</span>
    </div>
  );
}
