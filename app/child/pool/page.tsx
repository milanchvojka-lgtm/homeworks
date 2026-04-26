import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { hasCompletedTodayChecks } from "@/lib/task-rotation";
import { startOfDayPrague } from "@/lib/time";
import { PoolSections } from "../_components/pool-sections";

export default async function ChildPoolPage() {
  const user = await getSession();
  if (!user) redirect("/");

  const today = startOfDayPrague();
  const checksOk = await hasCompletedTodayChecks(user.id, today);

  const instances = await db.taskInstance.findMany({
    where: { status: "AVAILABLE" },
    include: { task: true },
    orderBy: { createdAt: "asc" },
  });

  const userMap = new Map(
    (
      await db.user.findMany({
        where: { role: "CHILD" },
        select: { id: true, name: true, avatarColor: true },
      })
    ).map((u) => [u.id, u]),
  );

  type Item = {
    id: string;
    name: string;
    description: string | null;
    valueCzk: number;
    timeEstimateMinutes: number | null;
    unlockedForUserId: string | null;
    unlockExpiresAt: string | null;
    unlockedForName: string | null;
    unlockedForColor: string | null;
    queuePosition: number;
  };

  const myItems: Item[] = [];
  const lockedItems: Item[] = [];
  const upcomingItems: Item[] = [];

  for (const i of instances) {
    const queue = (i.rotationQueue as unknown as string[]) ?? [];
    const myIdx = queue.indexOf(user.id);
    const isOpen = i.unlockedForUserId === null;
    const mine = i.unlockedForUserId === user.id;
    const someoneElse = !mine && !isOpen;

    const unlocked = i.unlockedForUserId
      ? userMap.get(i.unlockedForUserId)
      : null;

    const item: Item = {
      id: i.id,
      name: i.task.name,
      description: i.task.description,
      valueCzk: i.task.valueCzk,
      timeEstimateMinutes: i.task.timeEstimateMinutes,
      unlockedForUserId: i.unlockedForUserId,
      unlockExpiresAt: i.unlockExpiresAt?.toISOString() ?? null,
      unlockedForName: unlocked?.name ?? null,
      unlockedForColor: unlocked?.avatarColor ?? null,
      queuePosition: myIdx,
    };

    if (mine || isOpen) myItems.push(item);
    else if (someoneElse) lockedItems.push(item);
    else upcomingItems.push(item);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Pool úkolů</h1>
      {!checksOk && (
        <p className="mt-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          Než si vezmeš úkol, dokonči nejdřív dnešní kompetenci.
        </p>
      )}

      <PoolSections
        canClaim={checksOk}
        myItems={myItems}
        lockedItems={lockedItems}
        upcomingItems={upcomingItems}
      />
    </div>
  );
}
