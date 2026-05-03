import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { TaskForm } from "../_task-form";

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
    <div>
      <Link
        href="/admin/ukoly"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Úkoly
      </Link>
      <h1 className="mt-3 text-2xl font-semibold">{task.name}</h1>

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

      <h2 className="mt-10 text-lg font-semibold">Posledních 10 instancí</h2>
      <ul className="mt-3 space-y-1 text-sm">
        {instances.length === 0 && (
          <li className="text-muted-foreground">Žádné instance.</li>
        )}
        {instances.map((i) => (
          <li
            key={i.id}
            className="flex justify-between rounded-lg border border-border bg-card px-3 py-2"
          >
            <span>{new Date(i.createdAt).toLocaleString("cs-CZ")}</span>
            <span className="text-muted-foreground">{i.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
