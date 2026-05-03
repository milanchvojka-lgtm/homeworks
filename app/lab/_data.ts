// Mock data sdílená mezi vibes — všechny tři ukazují stejný obsah, jen jiný design.

export const childName = "Terka";

export const streak = {
  days: 17,
  tier: "Silver",
  longestStreak: 89,
};

export const monthlyBonus = {
  current: 150,
  full: 200,
  step: 50,
  misses: 1,
};

export const todayChecks = [
  { id: 1, label: "Postel ustelená", done: true },
  { id: 2, label: "Pokoj uklizený", done: true },
  { id: 3, label: "Domácí úkoly", done: false },
  { id: 4, label: "Zubky večer", done: false },
];

export const credit = {
  balanceCzk: 487,
  weeklyEarnedCzk: 120,
  screenTimeMinutes: 45,
};

export const poolCount = 2;
export const myTasksCount = 1;

export const trophies = [
  { emoji: "🥉", name: "Iron Will", days: 7, earnedAt: "12. 4. 2026", earned: true },
  { emoji: "🥈", name: "Steady", days: 14, earnedAt: "19. 4. 2026", earned: true },
  { emoji: "🥇", name: "Flawless Month", days: 30, earned: false, current: true },
  { emoji: "💎", name: "Unbreakable", days: 60, earned: false },
  { emoji: "👑", name: "Centurion", days: 100, earned: false },
  { emoji: "⚡", name: "Legend", days: 365, earned: false },
];
