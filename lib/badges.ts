import "server-only";
import { db } from "./db";

/** Počet položek čekajících na adminovo schválení (Inbox). */
export async function getAdminInboxCount(): Promise<number> {
  const [checks, tasks, screen] = await Promise.all([
    db.dailyCheckInstance.count({ where: { status: "SUBMITTED" } }),
    db.taskInstance.count({ where: { status: "PENDING_REVIEW" } }),
    db.screenTimeRequest.count({ where: { status: "PENDING" } }),
  ]);
  return checks + tasks + screen;
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

/** Počet úkolů, které dítě právě má (CLAIMED nebo REJECTED — vyžadují akci). */
export async function getChildMyTasksCount(userId: string): Promise<number> {
  return db.taskInstance.count({
    where: {
      claimedById: userId,
      status: { in: ["CLAIMED", "REJECTED"] },
    },
  });
}
