import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { hasCompletedTodayChecks } from "@/lib/task-rotation";
import { startOfDayPrague } from "@/lib/time";
import { PoolSections } from "../_components/pool-sections";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="space-y-3">
      {!checksOk && (
        <Card className="border-destructive/40">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-destructive">
              Než si vezmeš úkol, dokonči nejdřív dnešní kompetenci.
            </p>
          </CardContent>
        </Card>
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
