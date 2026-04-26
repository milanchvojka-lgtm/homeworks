import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron";
import { db } from "@/lib/db";
import { shiftRotation } from "@/lib/task-rotation";

/**
 * Volá GitHub Actions každých 15 min.
 * - AVAILABLE TaskInstance s prošlým unlockExpiresAt → posun rotace (nebo EXPIRED).
 * - CLAIMED s prošlým executeDeadline → vrátí do poolu (status AVAILABLE,
 *   vyčistí claim fields, neresetuje rotation queue — další si vezme open phase).
 */
export async function GET(request: Request) {
  const unauth = checkCronAuth(request);
  if (unauth) return unauth;

  const now = new Date();
  let shifted = 0;
  let returned = 0;

  const expiredAvailable = await db.taskInstance.findMany({
    where: {
      status: "AVAILABLE",
      unlockExpiresAt: { lt: now },
    },
    select: { id: true },
  });
  for (const i of expiredAvailable) {
    await shiftRotation(i.id);
    shifted++;
  }

  const expiredClaimed = await db.taskInstance.updateMany({
    where: {
      status: "CLAIMED",
      executeDeadline: { lt: now },
    },
    data: {
      status: "AVAILABLE",
      claimedById: null,
      claimedAt: null,
      executeDeadline: null,
      unlockedForUserId: null,
      unlockExpiresAt: now,
    },
  });
  returned = expiredClaimed.count;

  return NextResponse.json(
    { status: "ok", shifted, returned },
    { headers: { "cache-control": "no-store" } },
  );
}
