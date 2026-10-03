import "server-only";
import { db } from "./db";
import { endOfWeekPrague, startOfDayPrague, startOfWeekPrague } from "./time";

export type ScreenRecord = {
  id: string;
  userId: string;
  childName: string;
  minutes: number;
  costCzk: number;
  recordedAt: Date;
  /** D30: only today's record can be undone. */
  cancellable: boolean;
};

/** D30: screen time recorded this week (one child, or all), newest first. */
export async function getWeekScreenRecords(userId?: string): Promise<ScreenRecord[]> {
  const rows = await db.screenTimeRequest.findMany({
    where: {
      status: "APPROVED",
      reviewedAt: { gte: startOfWeekPrague(), lte: endOfWeekPrague() },
      ...(userId ? { userId } : {}),
    },
    include: { user: { select: { name: true } } },
    orderBy: { reviewedAt: "desc" },
  });
  const today = startOfDayPrague();
  return rows.map((r) => {
    const recordedAt = r.reviewedAt ?? r.createdAt;
    return {
      id: r.id,
      userId: r.userId,
      childName: r.user.name,
      minutes: r.minutes,
      costCzk: r.costCzk,
      recordedAt,
      cancellable: recordedAt >= today,
    };
  });
}
