import { type DayCell } from "@/components/streak/streak-grid";
import { type BonusStatus } from "@/lib/bonus";

// ─── Ani — child user ────────────────────────────────────────────────────────

export const ANI_PROFILE = {
  name: "Ani",
  avatarColor: "#f59e0b",
  role: "CHILD" as const,
  currentStreak: 47,
  longestStreak: 89,
  lastStreakDate: "2026-05-03",
  brokenStreaksCount: 1,
};

export const ANI_BONUS: BonusStatus = {
  misses: 0,
  currentBonusCzk: 200,
  fullBonusCzk: 200,
  stepCzk: 50,
  lostOn: null,
};

export type TodayCheck = {
  id: string;
  name: string;
  timeOfDay: "MORNING" | "ANYTIME" | "EVENING";
  status: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";
};

export const ANI_TODAY_CHECKS: TodayCheck[] = [
  { id: "c1", name: "Postel ustelená", timeOfDay: "MORNING", status: "APPROVED" },
  { id: "c2", name: "Pokoj uklizený", timeOfDay: "MORNING", status: "APPROVED" },
  { id: "c3", name: "Domácí úkoly", timeOfDay: "ANYTIME", status: "SUBMITTED" },
  { id: "c4", name: "Zubky večer", timeOfDay: "EVENING", status: "PENDING" },
];

export const ANI_COMPETENCY = "Obývák";

export type PoolTask = {
  id: string;
  name: string;
  rewardCzk: number;
  durationMin: number;
  note?: string;
  waitingFor?: { name: string; avatarColor: string };
};

export const ANI_POOL_TASKS: PoolTask[] = [
  {
    id: "pt1",
    name: "Vyluxovat schody",
    rewardCzk: 60,
    durationMin: 20,
  },
  {
    id: "pt2",
    name: "Umýt okna v kuchyni",
    rewardCzk: 120,
    durationMin: 40,
    note: "Otevřeno tobě, do 17:00",
  },
  {
    id: "pt3",
    name: "Vynést tříděný odpad",
    rewardCzk: 40,
    durationMin: 10,
    waitingFor: { name: "Emi", avatarColor: "#10b981" },
  },
];

export type MyTask = {
  id: string;
  name: string;
  rewardCzk: number;
  status: "CLAIMED" | "SUBMITTED" | "APPROVED";
  executeDeadline: string;
};

export const ANI_MY_TASKS: MyTask[] = [
  {
    id: "mt1",
    name: "Vyluxovat obývák",
    rewardCzk: 50,
    status: "CLAIMED",
    executeDeadline: "16:30",
  },
];

export const ANI_CREDIT = {
  balanceCzk: 1240,
  weeklyEarnedCzk: 280,
  weeklyScreenCzk: 90,
  weeklyPayoutCzk: 190,
  screenTimeOptions: [
    { minutes: 30, priceCzk: 100 },
    { minutes: 60, priceCzk: 200 },
    { minutes: 90, priceCzk: 300 },
  ],
};

export type WeekHistory = {
  id: string;
  weekStart: string;
  weekEnd: string;
  earnedCzk: number;
  screenCzk: number;
  payoutCzk: number;
  paidOutAt: string | null;
  bonusNote?: string;
};

export const ANI_HISTORY: WeekHistory[] = [
  {
    id: "wh1",
    weekStart: "2026-04-19",
    weekEnd: "2026-04-25",
    earnedCzk: 320,
    screenCzk: 120,
    payoutCzk: 200,
    paidOutAt: "2026-04-26",
  },
  {
    id: "wh2",
    weekStart: "2026-04-12",
    weekEnd: "2026-04-18",
    earnedCzk: 280,
    screenCzk: 80,
    payoutCzk: 200,
    paidOutAt: "2026-04-19",
  },
  {
    id: "wh3",
    weekStart: "2026-04-05",
    weekEnd: "2026-04-11",
    earnedCzk: 240,
    screenCzk: 60,
    payoutCzk: 380,
    paidOutAt: "2026-04-12",
    bonusNote: "+200 Kč Unbreakable bonus",
  },
  {
    id: "wh4",
    weekStart: "2026-03-29",
    weekEnd: "2026-04-04",
    earnedCzk: 300,
    screenCzk: 100,
    payoutCzk: 200,
    paidOutAt: "2026-04-05",
  },
  {
    id: "wh5",
    weekStart: "2026-03-22",
    weekEnd: "2026-03-28",
    earnedCzk: 260,
    screenCzk: 90,
    payoutCzk: 270,
    paidOutAt: "2026-03-29",
    bonusNote: "+100 Kč Flawless Month bonus",
  },
  {
    id: "wh6",
    weekStart: "2026-03-15",
    weekEnd: "2026-03-21",
    earnedCzk: 220,
    screenCzk: 50,
    payoutCzk: 170,
    paidOutAt: "2026-03-22",
  },
];

export type TrophyItem = {
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
  remainingDays?: number;
};

export const ANI_TROPHIES: TrophyItem[] = [
  {
    milestone: { id: "m1", days: 7, rewardCzk: 0, trophyName: "Iron Will", emoji: "🔩" },
    status: "earned",
    earnedAt: new Date("2026-02-14"),
    rewardPaidAt: null,
  },
  {
    milestone: { id: "m2", days: 21, rewardCzk: 0, trophyName: "Steady", emoji: "⚡" },
    status: "earned",
    earnedAt: new Date("2026-02-21"),
    rewardPaidAt: null,
  },
  {
    milestone: { id: "m3", days: 30, rewardCzk: 100, trophyName: "Flawless Month", emoji: "🌟" },
    status: "earned",
    earnedAt: new Date("2026-03-15"),
    rewardPaidAt: new Date("2026-03-29"),
  },
  {
    milestone: { id: "m4", days: 60, rewardCzk: 200, trophyName: "Unbreakable", emoji: "💪" },
    status: "earned",
    earnedAt: new Date("2026-04-13"),
    rewardPaidAt: new Date("2026-04-12"),
  },
  {
    milestone: { id: "m5", days: 100, rewardCzk: 300, trophyName: "Centurion", emoji: "🏆" },
    status: "current",
    remainingDays: 53,
  },
  {
    milestone: { id: "m6", days: 365, rewardCzk: 1000, trophyName: "Legend", emoji: "👑" },
    status: "locked",
  },
];

/**
 * Generate 84 streak grid cells for Ani.
 * Today is rightmost (index 83).
 * - Cells 83–37 (last 47 days): approved (current streak)
 * - Cell 36: missed (the streak break)
 * - Cells 35–7: approved (previous 89-day cycle tail, 29 days)
 * - Cells 6–0: empty (before the previous cycle)
 */
export function generateAniStreakCells(): DayCell[] {
  const cells: DayCell[] = [];
  for (let i = 0; i < 84; i++) {
    const daysFromToday = 83 - i; // 83 = oldest, 0 = today
    if (daysFromToday < 47) {
      // Last 47 days: approved (current streak)
      cells.push({ kind: "approved" });
    } else if (daysFromToday === 47) {
      // The break day
      cells.push({ kind: "missed" });
    } else if (daysFromToday <= 76) {
      // Previous streak tail: approved
      cells.push({ kind: "approved" });
    } else {
      // Before previous cycle
      cells.push({ kind: "empty" });
    }
  }
  return cells;
}

// ─── Milan — admin user ───────────────────────────────────────────────────────

export const MILAN_PROFILE = {
  name: "Milan",
  avatarColor: "#2563eb",
  role: "ADMIN" as const,
};

export type InboxGroup = {
  userId: string;
  userName: string;
  avatarColor: string;
  items: InboxItem[];
};

export type InboxItem = {
  id: string;
  kind: "check" | "task" | "screen";
  title: string;
  subtitle: string;
  submittedAt: string;
  amountCzk?: number;
};

export const MILAN_INBOX: InboxGroup[] = [
  {
    userId: "u-ani",
    userName: "Ani",
    avatarColor: "#f59e0b",
    items: [
      {
        id: "i1",
        kind: "check",
        title: "Domácí úkoly",
        subtitle: "Denní check · ANYTIME",
        submittedAt: "14:30",
      },
      {
        id: "i2",
        kind: "task",
        title: "Vyluxovat obývák",
        subtitle: "Úkol · dokončen",
        submittedAt: "14:15",
        amountCzk: 50,
      },
    ],
  },
  {
    userId: "u-emi",
    userName: "Emi",
    avatarColor: "#10b981",
    items: [
      {
        id: "i3",
        kind: "check",
        title: "Vynesený koš",
        subtitle: "Denní check · MORNING",
        submittedAt: "09:15",
      },
      {
        id: "i4",
        kind: "screen",
        title: "60 min obrazovky",
        subtitle: "Screen time request",
        submittedAt: "13:40",
        amountCzk: 200,
      },
    ],
  },
  {
    userId: "u-neli",
    userName: "Neli",
    avatarColor: "#8b5cf6",
    items: [
      {
        id: "i5",
        kind: "check",
        title: "Pověsit ručníky",
        subtitle: "Denní check · MORNING",
        submittedAt: "08:45",
      },
    ],
  },
];

export type Competency = {
  id: string;
  name: string;
  checksCount: number;
  assignedTo: { name: string; avatarColor: string };
};

export const MILAN_COMPETENCIES: Competency[] = [
  {
    id: "comp1",
    name: "Kuchyň",
    checksCount: 3,
    assignedTo: { name: "Emi", avatarColor: "#10b981" },
  },
  {
    id: "comp2",
    name: "Obývák",
    checksCount: 3,
    assignedTo: { name: "Ani", avatarColor: "#f59e0b" },
  },
  {
    id: "comp3",
    name: "Koupelna",
    checksCount: 3,
    assignedTo: { name: "Neli", avatarColor: "#8b5cf6" },
  },
];

export type TaskDefinition = {
  id: string;
  name: string;
  rewardCzk: number;
  durationMin: number;
  frequency: "weekly" | "monthly" | "ad hoc";
  active: boolean;
};

export const MILAN_TASKS: TaskDefinition[] = [
  { id: "td1", name: "Vyluxovat obývák", rewardCzk: 50, durationMin: 15, frequency: "weekly", active: true },
  { id: "td2", name: "Vyluxovat schody", rewardCzk: 60, durationMin: 20, frequency: "weekly", active: true },
  { id: "td3", name: "Umýt okna v kuchyni", rewardCzk: 120, durationMin: 40, frequency: "monthly", active: true },
  { id: "td4", name: "Vynést tříděný odpad", rewardCzk: 40, durationMin: 10, frequency: "weekly", active: true },
  { id: "td5", name: "Vyluxovat půdičku", rewardCzk: 80, durationMin: 30, frequency: "ad hoc", active: true },
  { id: "td6", name: "Umýt sprchový kout", rewardCzk: 100, durationMin: 25, frequency: "monthly", active: false },
];

export type UserRow = {
  id: string;
  name: string;
  avatarColor: string;
  role: "ADMIN" | "CHILD";
  monthlyAllowanceCzk?: number;
  rotationOrder?: number;
};

export const MILAN_USERS: UserRow[] = [
  { id: "u1", name: "Milan", avatarColor: "#2563eb", role: "ADMIN" },
  { id: "u2", name: "Teri", avatarColor: "#db2777", role: "ADMIN" },
  { id: "u3", name: "Ani", avatarColor: "#f59e0b", role: "CHILD", monthlyAllowanceCzk: 500, rotationOrder: 1 },
  { id: "u4", name: "Emi", avatarColor: "#10b981", role: "CHILD", monthlyAllowanceCzk: 500, rotationOrder: 2 },
  { id: "u5", name: "Neli", avatarColor: "#8b5cf6", role: "CHILD", monthlyAllowanceCzk: 500, rotationOrder: 3 },
];

export type PayoutWeek = {
  id: string;
  weekLabel: string;
  payouts: { userName: string; avatarColor: string; amountCzk: number; paid: boolean }[];
};

export const MILAN_PAYOUTS: PayoutWeek[] = [
  {
    id: "pw1",
    weekLabel: "19.4. – 25.4. 2026",
    payouts: [
      { userName: "Ani", avatarColor: "#f59e0b", amountCzk: 200, paid: true },
      { userName: "Emi", avatarColor: "#10b981", amountCzk: 180, paid: false },
      { userName: "Neli", avatarColor: "#8b5cf6", amountCzk: 220, paid: true },
    ],
  },
  {
    id: "pw2",
    weekLabel: "12.4. – 18.4. 2026",
    payouts: [
      { userName: "Ani", avatarColor: "#f59e0b", amountCzk: 200, paid: true },
      { userName: "Emi", avatarColor: "#10b981", amountCzk: 160, paid: true },
      { userName: "Neli", avatarColor: "#8b5cf6", amountCzk: 190, paid: true },
    ],
  },
  {
    id: "pw3",
    weekLabel: "5.4. – 11.4. 2026",
    payouts: [
      { userName: "Ani", avatarColor: "#f59e0b", amountCzk: 380, paid: true },
      { userName: "Emi", avatarColor: "#10b981", amountCzk: 200, paid: true },
      { userName: "Neli", avatarColor: "#8b5cf6", amountCzk: 170, paid: true },
    ],
  },
  {
    id: "pw4",
    weekLabel: "29.3. – 4.4. 2026",
    payouts: [
      { userName: "Ani", avatarColor: "#f59e0b", amountCzk: 200, paid: true },
      { userName: "Emi", avatarColor: "#10b981", amountCzk: 210, paid: true },
      { userName: "Neli", avatarColor: "#8b5cf6", amountCzk: 185, paid: true },
    ],
  },
];

export const MILAN_SETTINGS = {
  hourlyRateCzk: 150,
  screenTimeHourCzk: 200,
  screenTimeGranularityMin: 30,
  monthlyBonusFullCzk: 200,
  monthlyBonusStepCzk: 50,
  defaultClaimTimeoutH: 24,
  defaultExecuteTimeoutH: 3,
};

export type Milestone = {
  id: string;
  days: number;
  rewardCzk: number;
  trophyName: string;
  emoji: string;
};

export const MILESTONES: Milestone[] = [
  { id: "ms1", days: 7, rewardCzk: 0, trophyName: "Iron Will", emoji: "🔩" },
  { id: "ms2", days: 21, rewardCzk: 0, trophyName: "Steady", emoji: "⚡" },
  { id: "ms3", days: 30, rewardCzk: 100, trophyName: "Flawless Month", emoji: "🌟" },
  { id: "ms4", days: 60, rewardCzk: 200, trophyName: "Unbreakable", emoji: "💪" },
  { id: "ms5", days: 100, rewardCzk: 300, trophyName: "Centurion", emoji: "🏆" },
  { id: "ms6", days: 365, rewardCzk: 1000, trophyName: "Legend", emoji: "👑" },
];
