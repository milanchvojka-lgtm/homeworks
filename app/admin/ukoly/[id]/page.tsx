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
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
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
          <li className="text-zinc-500">Žádné instance.</li>
        )}
        {instances.map((i) => (
          <li
            key={i.id}
            className="flex justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span>{new Date(i.createdAt).toLocaleString("cs-CZ")}</span>
            <span className="text-zinc-500">{i.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
