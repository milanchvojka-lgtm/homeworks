import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
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
    <div>
      <h1 className="text-2xl font-semibold">Mé úkoly</h1>
      {claimed.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">Aktuálně nemáš žádný úkol.</p>
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
