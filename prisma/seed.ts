import { PrismaClient, type TimeOfDay } from "@prisma/client";
import bcrypt from "bcryptjs";
import { startOfDayPrague } from "../lib/time";
import { computeDayIndex, rotateAssignments } from "../lib/rotation-pure";

const db = new PrismaClient();

const DEFAULT_PIN = "1234";

const USERS = [
  { name: "Milan", role: "ADMIN" as const, avatarColor: "#2563eb" },
  { name: "Teri", role: "ADMIN" as const, avatarColor: "#db2777" },
  {
    name: "Ani",
    role: "CHILD" as const,
    avatarColor: "#f59e0b",
    rotationOrder: 1,
  },
  {
    name: "Emi",
    role: "CHILD" as const,
    avatarColor: "#10b981",
    rotationOrder: 2,
  },
  {
    name: "Neli",
    role: "CHILD" as const,
    avatarColor: "#8b5cf6",
    rotationOrder: 3,
  },
];

type CheckSeed = { name: string; description?: string; timeOfDay: TimeOfDay; dueTime?: string };

// D32 catalog (docs/2026-10-04-katalog-ukolu.md): names describe the end state, detail under the name (D33).
const COMPETENCIES: {
  name: string;
  description: string;
  order: number;
  checks: CheckSeed[];
}[] = [
  {
    name: "Kuchyň a stůl",
    description: "Odpolední kolo, aby se dalo vařit a jíst.",
    order: 1,
    checks: [
      { name: "Myčka je prázdná", description: "Umyté nádobí uklizené na svém místě.", timeOfDay: "ANYTIME", dueTime: "18:30" },
      { name: "Linka je volná a čistá", description: "Utřená · koše vysypané · skleničky a sklo na půdičce · tašky a suché potraviny pryč.", timeOfDay: "ANYTIME", dueTime: "18:30" },
      { name: "Stůl je připravený k jídlu", description: "Uklizený a utřený.", timeOfDay: "ANYTIME", dueTime: "18:30" },
    ],
  },
  {
    name: "Obývák",
    description: "Společný obývák.",
    order: 2,
    checks: [
      { name: "Na kanapi se dá sednout", description: "Deky složené, polštáře na místě, žádné věci.", timeOfDay: "ANYTIME" },
      { name: "Obývák je vyvětraný", description: "Jednou denně okna na 5 minut.", timeOfDay: "ANYTIME" },
      { name: "Povrchy v obýváku jsou volné", description: "Piano, TV skříňka, komody bez odložených věcí.", timeOfDay: "ANYTIME" },
    ],
  },
  {
    name: "Prádlo a koupelna",
    description: "Prádlo a obě koupelny.",
    order: 3,
    checks: [
      { name: "Čisté prádlo je u majitelů", description: "Rozdělené a roznesené.", timeOfDay: "ANYTIME" },
      { name: "Koupelny jsou v pořádku", description: "Dole i nahoře: žádné drobnosti, ručníky pověšené.", timeOfDay: "ANYTIME" },
    ],
  },
];

const STREAK_MILESTONES: {
  days: number;
  rewardCzk: number;
  trophyName: string;
  emoji: string;
  sortOrder: number;
}[] = [
  { days: 7, rewardCzk: 0, trophyName: "Iron Will", emoji: "🥉", sortOrder: 1 },
  { days: 14, rewardCzk: 0, trophyName: "Steady", emoji: "🥈", sortOrder: 2 },
  { days: 30, rewardCzk: 100, trophyName: "Flawless Month", emoji: "🥇", sortOrder: 3 },
  { days: 60, rewardCzk: 200, trophyName: "Unbreakable", emoji: "💎", sortOrder: 4 },
  { days: 100, rewardCzk: 500, trophyName: "Centurion", emoji: "👑", sortOrder: 5 },
  { days: 365, rewardCzk: 2000, trophyName: "Legend", emoji: "⚡", sortOrder: 6 },
];

async function seedUsers() {
  const pinHash = await bcrypt.hash(DEFAULT_PIN, 10);
  for (const u of USERS) {
    const existing = await db.user.findFirst({ where: { name: u.name } });
    if (existing) {
      console.log(`skip user ${u.name}`);
      continue;
    }
    await db.user.create({ data: { ...u, pinHash } });
    console.log(`created user ${u.name} (${u.role})`);
  }
}

async function seedCompetencies() {
  for (const c of COMPETENCIES) {
    const existing = await db.competency.findFirst({ where: { name: c.name } });
    if (existing) {
      console.log(`skip competency ${c.name}`);
      continue;
    }
    await db.competency.create({
      data: {
        name: c.name,
        description: c.description,
        order: c.order,
        dailyChecks: {
          create: c.checks.map((check, i) => ({
            name: check.name,
            description: check.description,
            timeOfDay: check.timeOfDay,
            dueTime: check.dueTime,
            order: i + 1,
          })),
        },
      },
    });
    console.log(`created competency ${c.name} with ${c.checks.length} checks`);
  }
}

async function seedTodayAssignments() {
  const date = startOfDayPrague();
  const children = await db.user.findMany({
    where: { role: "CHILD" },
    orderBy: { rotationOrder: "asc" },
  });
  const competencies = await db.competency.findMany({
    orderBy: { order: "asc" },
  });

  const plan = rotateAssignments(children, competencies, computeDayIndex(date));
  const { count } = await db.competencyAssignment.createMany({
    data: plan.map((p) => ({ userId: p.childId, competencyId: p.competency.id, date })),
    skipDuplicates: true,
  });
  console.log(`assigned ${count} role(s) for today`);
}

async function seedAppSettings() {
  const existing = await db.appSettings.findFirst();
  if (existing) {
    console.log("skip app settings (already exists)");
    return;
  }
  await db.appSettings.create({ data: {} });
  console.log("created app settings (defaults)");
}

async function seedStreakMilestones() {
  for (const m of STREAK_MILESTONES) {
    const existing = await db.streakMilestone.findUnique({ where: { days: m.days } });
    if (existing) {
      console.log(`skip streak milestone ${m.days} (${m.trophyName})`);
      continue;
    }
    await db.streakMilestone.create({ data: m });
    console.log(`created streak milestone ${m.days} (${m.trophyName})`);
  }
}

async function main() {
  await seedUsers();
  await seedCompetencies();
  await seedTodayAssignments();
  await seedAppSettings();
  await seedStreakMilestones();
  console.log(`\nDefault PIN: ${DEFAULT_PIN}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
