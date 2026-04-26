import { PrismaClient, type TimeOfDay } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  endOfWeekPrague,
  startOfWeekPrague,
} from "../lib/time";

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
    monthlyAllowanceCzk: 500,
  },
  {
    name: "Emi",
    role: "CHILD" as const,
    avatarColor: "#10b981",
    rotationOrder: 2,
    monthlyAllowanceCzk: 500,
  },
  {
    name: "Neli",
    role: "CHILD" as const,
    avatarColor: "#8b5cf6",
    rotationOrder: 3,
    monthlyAllowanceCzk: 500,
  },
];

type CheckSeed = { name: string; timeOfDay: TimeOfDay };

const COMPETENCIES: {
  name: string;
  description: string;
  order: number;
  checks: CheckSeed[];
}[] = [
  {
    name: "Kuchyň",
    description: "Pořádek v kuchyni a u jídelního stolu.",
    order: 1,
    checks: [
      { name: "Umýt nádobí po snídani", timeOfDay: "MORNING" },
      { name: "Utřít stůl po večeři", timeOfDay: "EVENING" },
      { name: "Vynést koš (když je plný)", timeOfDay: "ANYTIME" },
    ],
  },
  {
    name: "Obývák",
    description: "Úklid společného obýváku.",
    order: 2,
    checks: [
      { name: "Vyvětrat", timeOfDay: "MORNING" },
      { name: "Uklidit hračky a věci", timeOfDay: "EVENING" },
      { name: "Vysát (1×/týden)", timeOfDay: "ANYTIME" },
    ],
  },
  {
    name: "Koupelna",
    description: "Pořádek v koupelně.",
    order: 3,
    checks: [
      { name: "Pověsit ručníky", timeOfDay: "MORNING" },
      { name: "Utřít umyvadlo", timeOfDay: "EVENING" },
      { name: "Doplnit toaleťák (když chybí)", timeOfDay: "ANYTIME" },
    ],
  },
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
            timeOfDay: check.timeOfDay,
            order: i + 1,
          })),
        },
      },
    });
    console.log(`created competency ${c.name} with ${c.checks.length} checks`);
  }
}

async function seedCurrentWeekAssignments() {
  const weekStart = startOfWeekPrague();
  const weekEnd = endOfWeekPrague();

  const children = await db.user.findMany({
    where: { role: "CHILD" },
    orderBy: { rotationOrder: "asc" },
  });
  const competencies = await db.competency.findMany({
    orderBy: { order: "asc" },
  });

  if (children.length !== 3 || competencies.length !== 3) {
    console.log("skip assignments (need 3 children + 3 competencies)");
    return;
  }

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const competency = competencies[i];

    const exists = await db.competencyAssignment.findUnique({
      where: { userId_weekStart: { userId: child.id, weekStart } },
    });
    if (exists) {
      console.log(`skip assignment ${child.name}`);
      continue;
    }

    await db.competencyAssignment.create({
      data: {
        userId: child.id,
        competencyId: competency.id,
        weekStart,
        weekEnd,
      },
    });
    console.log(`assigned ${child.name} → ${competency.name}`);
  }
}

async function main() {
  await seedUsers();
  await seedCompetencies();
  await seedCurrentWeekAssignments();
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
