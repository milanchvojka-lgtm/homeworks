import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { TaskForm } from "../_task-form";
import { AdminSubpage } from "../../_components/subpage";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = await db.task.findUnique({ where: { id } });
  if (!task) notFound();

  const instances = await db.taskInstance.findMany({
    where: { taskId: id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <AdminSubpage title={task.name} back="/admin/ukoly">
      <TaskForm
        mode={{ kind: "edit", id: task.id, isActive: task.isActive }}
        initial={{
          name: task.name,
          description: task.description ?? "",
          valueCzk: task.valueCzk,
          timeEstimateMinutes: task.timeEstimateMinutes,
          frequencyDays: task.frequencyDays,
          claimTimeoutHours: task.claimTimeoutHours,
          executeTimeoutHours: task.executeTimeoutHours,
        }}
      />

      <h2 className="mt-6 font-mono text-xs font-bold tracking-[0.12em] uppercase">Posledních 10 instancí</h2>
      <ul className="flex flex-col gap-1.5 text-sm">
        {instances.length === 0 && (
          <li className="text-muted-foreground">Žádné instance.</li>
        )}
        {instances.map((i) => (
          <li
            key={i.id}
            className="flex justify-between rounded-lg border border-border bg-card px-3.5 py-2.5"
          >
            <span>{new Date(i.createdAt).toLocaleString("cs-CZ")}</span>
            <span className="text-muted-foreground">{i.status}</span>
          </li>
        ))}
      </ul>
    </AdminSubpage>
  );
}
