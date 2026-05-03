import { Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { type BonusStatus } from "@/lib/bonus";
import { tierFromStreak, nextTierProgress } from "@/lib/streak";

type StreakBannerProps = {
  currentStreak: number;
  longestStreak: number;
  bonus: BonusStatus;
};

function pluralizeDays(days: number): string {
  if (days === 1) return "den";
  if (days >= 2 && days <= 4) return "dny";
  return "dnů";
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "numeric",
  });
}

export function StreakBanner({ currentStreak, longestStreak, bonus }: StreakBannerProps) {
  const limeStyle = { color: "var(--chart-1)" };
  const limeBg = { backgroundColor: "var(--chart-1)" };

  const { current: currentTier, progress, remaining } = nextTierProgress(currentStreak);
  const isMaster = currentTier.next === null;

  // Next tier — find the tier after current
  const nextTierName = isMaster
    ? null
    : tierFromStreak(currentTier.next!).name;
  const nextTierEmoji = isMaster
    ? null
    : tierFromStreak(currentTier.next!).emoji;

  const { misses, currentBonusCzk, fullBonusCzk, lostOn } = bonus;
  const bonusLost = currentBonusCzk === 0 && lostOn !== null;

  // Dots: 4 slots total. Lime = ok slots (4 - misses), muted = missed slots
  const okDots = Math.max(0, 4 - misses);
  const missDots = Math.min(misses, 4);

  return (
    <Card>
      <CardContent className="space-y-4 pt-5">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            STREAK
          </div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground tabular-nums">
            REKORD · {longestStreak} DNŮ
          </div>
        </div>

        {/* Hero stat */}
        <div className="flex items-end gap-3">
          {currentStreak === 0 ? (
            <span className="size-8 shrink-0 flex items-center justify-center text-2xl leading-none">
              💔
            </span>
          ) : (
            <Flame
              className="size-8 shrink-0"
              fill="var(--chart-1)"
              style={limeStyle}
            />
          )}
          <span className="text-6xl font-bold leading-none tabular-nums">
            {currentStreak}
          </span>
          <span className="pb-1.5 text-sm text-muted-foreground">
            {pluralizeDays(currentStreak)} v řadě
          </span>
        </div>

        <Separator />

        {/* Tier row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-card ring-2 ring-border">
              <span className="text-2xl">{currentTier.emoji}</span>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                AKTUÁLNÍ TIER
              </div>
              <div className="text-xl font-bold">{currentTier.name}</div>
            </div>
          </div>

          {isMaster ? (
            <div className="text-right">
              <div className="text-xl font-bold" style={limeStyle}>
                Vrchol! 👑
              </div>
            </div>
          ) : (
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                DALŠÍ
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-xl font-bold" style={limeStyle}>
                  {nextTierEmoji} {nextTierName}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {isMaster ? (
          <div className="text-center text-sm text-muted-foreground">
            Master tier — nejvyšší úroveň!
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="h-2 rounded-sm overflow-hidden bg-secondary">
              <div
                className="h-full rounded-sm transition-all"
                style={{ width: `${Math.min(progress * 100, 100)}%`, ...limeBg }}
              />
            </div>
            <div className="flex justify-between text-[11px] tabular-nums">
              <span>
                {currentStreak} / {currentTier.next}
              </span>
              <span className="text-muted-foreground">
                za {remaining} {pluralizeDays(remaining ?? 0)} → {nextTierName}
              </span>
            </div>
          </div>
        )}

        {/* Bonus section */}
        <div className="mt-4 space-y-3">
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                BONUS TENTO MĚSÍC
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span
                  className="text-3xl font-bold tabular-nums"
                  style={bonusLost ? undefined : limeStyle}
                >
                  <span className={bonusLost ? "text-muted-foreground" : undefined}>
                    {currentBonusCzk} Kč
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  z {fullBonusCzk} Kč
                </span>
              </div>
              {bonusLost && lostOn && (
                <div className="text-[10px] text-muted-foreground">
                  ztráceno {formatDateShort(lostOn)}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="flex gap-1">
                {Array.from({ length: okDots }).map((_, i) => (
                  <div
                    key={`ok-${i}`}
                    className="size-2.5 rounded-sm"
                    style={limeBg}
                  />
                ))}
                {Array.from({ length: missDots }).map((_, i) => (
                  <div
                    key={`miss-${i}`}
                    className="size-2.5 rounded-sm bg-secondary"
                  />
                ))}
              </div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {misses}× zaváhání
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
