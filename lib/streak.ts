export const TIERS = [
  { name: "Bronze", min: 0, next: 7, emoji: "🥉" },
  { name: "Silver", min: 7, next: 30, emoji: "🥈" },
  { name: "Gold", min: 30, next: 60, emoji: "🥇" },
  { name: "Platinum", min: 60, next: 100, emoji: "💎" },
  { name: "Diamond", min: 100, next: 365, emoji: "💠" },
  { name: "Master", min: 365, next: null, emoji: "👑" },
] as const;

export type Tier = (typeof TIERS)[number];

export function tierFromStreak(days: number): Tier {
  return [...TIERS].reverse().find((t) => days >= t.min) ?? TIERS[0];
}

export type TierProgress = {
  current: Tier;
  progress: number; // 0..1, 1 if at Master tier
  remaining: number | null; // days to next tier, null if at Master
};

export function nextTierProgress(days: number): TierProgress {
  const current = tierFromStreak(days);
  if (current.next === null) {
    return { current, progress: 1, remaining: null };
  }
  return {
    current,
    progress: (days - current.min) / (current.next - current.min),
    remaining: current.next - days,
  };
}

export type DayOutcome = "APPROVED" | "MISSED" | "REJECTED";

export function applyDayOutcome(prevStreak: number, outcome: DayOutcome): number {
  return outcome === "APPROVED" ? prevStreak + 1 : 0;
}
