// One-off launch data load (LAUNCH_CHECKLIST §4) from the "podklady pro ostrý provoz" sheet, 2026-10-04.
// Dry run by default; `--apply` writes. Targets the DB in `.env` (production).
// Run: NODE_OPTIONS=--conditions=react-server npx tsx prisma/launch-load.ts [--apply]
// (react-server condition lets lib/task-rotation load outside Next — it imports "server-only".)
import { config } from "dotenv";
config({ path: ".env", override: true });

import bcrypt from "bcryptjs";
import type { TimeOfDay } from "@prisma/client";

const APPLY = process.argv.includes("--apply");
const TEMP_PIN = "0000"; // same as resetPinAction (D25: child picks own PIN after welcome)

const PILOT_CHILD = "Test";
const OLD_COMPETENCIES = ["Stůl", "Kanape", "Kuchyň"];
const OLD_TASKS = ["Půdička", "Umýt okna", "Umýt auto"];

const CHILDREN = [
  { name: "Emi", rotationOrder: 1, avatarColor: "#10b981" },
  { name: "Neli", rotationOrder: 2, avatarColor: "#8b5cf6" },
  { name: "Ani", rotationOrder: 3, avatarColor: "#f59e0b" },
];

type CheckRow = { name: string; description: string; dueTime?: string };
const COMPETENCIES: { name: string; order: number; checks: CheckRow[] }[] = [
  {
    name: "Kuchyň a stůl",
    order: 1,
    checks: [
      { name: "Myčka je prázdná", description: "Umyté nádobí uklizené na svém místě.", dueTime: "17:00" },
      { name: "Linka je volná a čistá", description: "Utřená · koše vysypané · skleničky a sklo na půdičce · tašky a suché potraviny pryč.", dueTime: "17:00" },
      { name: "Stůl je připravený k jídlu", description: "Uklizený a utřený.", dueTime: "17:00" },
    ],
  },
  {
    name: "Obývák",
    order: 2,
    checks: [
      { name: "Na kanapi se dá sednout", description: "Deky složené, polštáře na místě, žádné věci." },
      { name: "Obývák je vyvětraný", description: "Jednou denně okna na 5 minut." },
      { name: "Povrchy v obýváku jsou volné", description: "Piano, TV skříňka, komody bez odložených věcí." },
    ],
  },
  {
    name: "Prádlo a koupelna",
    order: 3,
    checks: [
      { name: "Čisté prádlo je u majitelů", description: "Rozdělené a roznesené." },
      { name: "Koupelny jsou v pořádku", description: "Dole i nahoře: žádné drobnosti, ručníky pověšené." },
    ],
  },
];

// D36: on-demand one-off tasks from the sheet are not loaded.
const TASKS: {
  name: string;
  description?: string;
  valueCzk: number;
  minutes: number;
  frequencyDays: number | null;
  claimH: number;
  executeH: number;
}[] = [
  { name: "Obývák je vysátý", valueCzk: 50, minutes: 20, frequencyDays: 7, claimH: 24, executeH: 3 },
  { name: "V obýváku není prach", description: "Piano, TV skříňka, komody.", valueCzk: 50, minutes: 20, frequencyDays: 7, claimH: 24, executeH: 3 },
  { name: "Koupelna dole i nahoře je čistá", description: "Záchod, zrcadlo, sprcha. Přízemí i patro.", valueCzk: 80, minutes: 30, frequencyDays: 7, claimH: 24, executeH: 3 },
  { name: "Umýt okna", valueCzk: 300, minutes: 120, frequencyDays: 90, claimH: 24, executeH: 4 },
  { name: "Umýt auto zvenku i zevnitř mámě", valueCzk: 400, minutes: 180, frequencyDays: null, claimH: 24, executeH: 4 },
  { name: "Umýt auto zvenku i zevnitř tátovi", valueCzk: 400, minutes: 180, frequencyDays: null, claimH: 24, executeH: 4 },
  { name: "Uklidit půdičku", valueCzk: 100, minutes: 45, frequencyDays: 2, claimH: 24, executeH: 3 },
  { name: "Srovnat botník", valueCzk: 75, minutes: 30, frequencyDays: 7, claimH: 24, executeH: 3 },
];

const SCREEN_TIME_HOUR_COST_CZK = 60;
const MILESTONE_REWARDS: Record<number, number> = { 7: 50, 14: 100, 30: 200, 60: 300, 100: 500, 365: 2000 };

async function main() {
  const { db } = await import("../lib/db");
  const { createTaskInstance } = await import("../lib/task-rotation");

  const host = new URL(process.env.DATABASE_URL!).hostname;
  console.log(`${APPLY ? "APPLY" : "DRY RUN"} against ${host}\n`);

  const users = await db.user.findMany();
  const milan = users.find((u) => u.name === "Milan" && u.role === "ADMIN");
  if (!milan) throw new Error("Milan (ADMIN) not found");

  const pilot = users.filter((u) => u.name === PILOT_CHILD && u.role === "CHILD");
  const missingKids = CHILDREN.filter((c) => !users.some((u) => u.name === c.name));
  const strayKids = users.filter(
    (u) => u.role === "CHILD" && u.name !== PILOT_CHILD && !CHILDREN.some((c) => c.name === u.name),
  );
  if (strayKids.length) throw new Error(`Unexpected children: ${strayKids.map((u) => u.name).join(", ")}`);

  const comps = await db.competency.findMany({ select: { id: true, name: true } });
  const unknownComps = comps.filter(
    (c) => !OLD_COMPETENCIES.includes(c.name) && !COMPETENCIES.some((n) => n.name === c.name),
  );
  if (unknownComps.length) throw new Error(`Unexpected competencies: ${unknownComps.map((c) => c.name).join(", ")}`);
  const oldComps = comps.filter((c) => OLD_COMPETENCIES.includes(c.name));
  const missingComps = COMPETENCIES.filter((n) => !comps.some((c) => c.name === n.name));

  const tasks = await db.task.findMany({ select: { id: true, name: true } });
  const oldTasks = tasks.filter((t) => OLD_TASKS.includes(t.name));
  // Old tasks are deleted first, so a new task named like an old one ("Umýt okna") is still created.
  const missingTasks = TASKS.filter((n) => !tasks.some((t) => t.name === n.name && !OLD_TASKS.includes(t.name)));

  const settings = await db.appSettings.findFirstOrThrow();
  const milestones = await db.streakMilestone.findMany({ orderBy: { days: "asc" } });
  const milestoneChanges = milestones.filter(
    (m) => MILESTONE_REWARDS[m.days] !== undefined && MILESTONE_REWARDS[m.days] !== m.rewardCzk,
  );

  console.log("Smazat pilotní dítě:", pilot.map((u) => u.name).join(", ") || "—");
  console.log("Založit děti (PIN 0000, dočasný):", missingKids.map((c) => `${c.name} #${c.rotationOrder}`).join(", ") || "—");
  console.log("Smazat staré kompetence:", oldComps.map((c) => c.name).join(", ") || "—");
  console.log("Založit kompetence:", missingComps.map((c) => `${c.name} (${c.checks.length})`).join(", ") || "—");
  console.log("Smazat staré úkoly:", oldTasks.map((t) => t.name).join(", ") || "—");
  console.log("Založit úkoly + instance do nabídky:", missingTasks.map((t) => `${t.name} ${t.valueCzk} Kč`).join(", ") || "—");
  console.log(
    "Cena hodiny obrazovky:",
    settings.screenTimeHourCostCzk === SCREEN_TIME_HOUR_COST_CZK
      ? "beze změny"
      : `${settings.screenTimeHourCostCzk} → ${SCREEN_TIME_HOUR_COST_CZK} Kč`,
  );
  console.log(
    "Trofeje:",
    milestoneChanges.map((m) => `${m.trophyName} ${m.rewardCzk} → ${MILESTONE_REWARDS[m.days]} Kč`).join(", ") || "beze změny",
  );

  if (!APPLY) {
    console.log("\nNic nezapsáno. Spusť s --apply.");
    await db.$disconnect();
    return;
  }

  const pinHash = await bcrypt.hash(TEMP_PIN, 10);
  const createdTaskIds: string[] = [];

  await db.$transaction(async (tx) => {
    // Cascades remove the pilot's credit, checks, payouts, trophies, sessions and today's role assignment.
    await tx.user.deleteMany({ where: { id: { in: pilot.map((u) => u.id) } } });
    for (const c of missingKids) {
      await tx.user.create({
        data: {
          name: c.name,
          role: "CHILD",
          pinHash,
          pinIsTemporary: true,
          avatarColor: c.avatarColor,
          rotationOrder: c.rotationOrder,
        },
      });
    }

    await tx.competency.deleteMany({ where: { id: { in: oldComps.map((c) => c.id) } } });
    for (const c of missingComps) {
      await tx.competency.create({
        data: {
          name: c.name,
          order: c.order,
          dailyChecks: {
            create: c.checks.map((k, i) => ({
              name: k.name,
              description: k.description,
              dueTime: k.dueTime ?? null,
              timeOfDay: "ANYTIME" as TimeOfDay,
              order: i + 1,
            })),
          },
        },
      });
    }

    await tx.task.deleteMany({ where: { id: { in: oldTasks.map((t) => t.id) } } });
    for (const t of missingTasks) {
      const task = await tx.task.create({
        data: {
          name: t.name,
          description: t.description ?? null,
          valueCzk: t.valueCzk,
          timeEstimateMinutes: t.minutes,
          frequencyDays: t.frequencyDays,
          claimTimeoutHours: t.claimH,
          executeTimeoutHours: t.executeH,
          createdById: milan.id,
        },
      });
      createdTaskIds.push(task.id);
    }

    await tx.appSettings.update({
      where: { id: settings.id },
      data: { screenTimeHourCostCzk: SCREEN_TIME_HOUR_COST_CZK },
    });
    for (const m of milestoneChanges) {
      await tx.streakMilestone.update({ where: { id: m.id }, data: { rewardCzk: MILESTONE_REWARDS[m.days] } });
    }
  });

  // Like createTaskAction: every new task goes straight to the offer (needs the children to exist).
  for (const id of createdTaskIds) await createTaskInstance(id);

  console.log(`\nZapsáno. Úkolů v nabídce: ${createdTaskIds.length}. Dál: daily-rollover (role a povinnosti na dnešek).`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
