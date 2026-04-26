import Link from "next/link";
import { TaskForm } from "../_task-form";

export default function NewTaskPage() {
  return (
    <div>
      <Link
        href="/admin/ukoly"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← Úkoly
      </Link>
      <h1 className="mt-3 text-2xl font-semibold">Nový úkol</h1>
      <TaskForm
        mode={{ kind: "create" }}
        initial={{
          name: "",
          description: "",
          valueCzk: 30,
          timeEstimateMinutes: null,
          frequencyDays: null,
          claimTimeoutHours: 24,
          executeTimeoutHours: 3,
        }}
      />
    </div>
  );
}
