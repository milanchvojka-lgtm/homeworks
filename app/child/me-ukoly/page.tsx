import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { MyTasksList } from "../_components/my-tasks-list";

export default async function ChildMyTasksPage() {
  const user = await getSession();
  if (!user) redirect("/");

  const claimed = await db.taskInstance.findMany({
    where: {
      claimedById: user.id,
      status: { in: ["CLAIMED", "PENDING_REVIEW", "REJECTED"] },
    },
    include: { task: true },
    orderBy: { claimedAt: "desc" },
  });

  return (
    <div className="space-y-3">
      {claimed.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Aktuálně nemáš žádný úkol.
          </CardContent>
        </Card>
      ) : (
        <MyTasksList
          items={claimed.map((i) => ({
            id: i.id,
            name: i.task.name,
            valueCzk: i.task.valueCzk,
            status: i.status,
            executeDeadline: i.executeDeadline?.toISOString() ?? null,
            reviewNote: i.reviewNote,
          }))}
        />
      )}
    </div>
  );
}
