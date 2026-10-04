import "server-only";
import { db } from "./db";
import { startOfDayPrague } from "./time";

/** Počet položek čekajících na adminovo schválení (Inbox). */
export async function getAdminInboxCount(): Promise<number> {
  // D30: screen time is approved in iOS, nothing waits here for it.
  const [checks, tasks] = await Promise.all([
    db.dailyCheckInstance.count({ where: { status: "SUBMITTED" } }),
    db.taskInstance.count({ where: { status: "PENDING_REVIEW" } }),
  ]);
  return checks + tasks;
}

/** Počet dnešních povinností, které dítě ještě musí odeslat (PENDING nebo vrácené). */
export async function getChildOpenChecksCount(userId: string, date: Date): Promise<number> {
  return db.dailyCheckInstance.count({
    where: { userId, date, status: { in: ["PENDING", "REJECTED"] } },
  });
}

/** Počet úkolů, které si může dítě vzít teď (unlocked pro mě nebo open phase). */
export async function getChildPoolCount(userId: string): Promise<number> {
  return db.taskInstance.count({
    where: {
      status: "AVAILABLE",
      OR: [{ unlockedForUserId: userId }, { unlockedForUserId: null }],
    },
  });
}

/**
 * Úkoly dítěte, o kterých má vědět: rozdělané a vrácené dnes. Vrácený úkol je ukončený (nový jde
 * dalším dětem), takže po dni vrácení už v odznaku nevisí.
 */
export async function getChildMyTasksCount(userId: string): Promise<number> {
  return db.taskInstance.count({
    where: {
      claimedById: userId,
      OR: [{ status: "CLAIMED" }, { status: "REJECTED", reviewedAt: { gte: startOfDayPrague() } }],
    },
  });
}
