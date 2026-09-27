import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { startOfDayPrague } from "./time";

type Reader = Pick<Prisma.TransactionClient, "absence">;

/** D24: ids of children away on `day` (Prague day of the given moment). */
export async function absentUserIds(day: Date = new Date(), tx: Reader = db): Promise<Set<string>> {
  const d = startOfDayPrague(day);
  const rows = await tx.absence.findMany({
    where: { fromDate: { lte: d }, toDate: { gte: d } },
    select: { userId: true },
  });
  return new Set(rows.map((r) => r.userId));
}

/** The absence covering `day` for this child, if any (the latest ending one). */
export async function currentAbsence(userId: string, day: Date = new Date()) {
  const d = startOfDayPrague(day);
  return db.absence.findFirst({
    where: { userId, fromDate: { lte: d }, toDate: { gte: d } },
    orderBy: { toDate: "desc" },
  });
}
