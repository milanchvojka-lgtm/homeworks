import { AdminSubpage } from "../../_components/subpage";
import { TaskForm } from "../_task-form";

export default function NewTaskPage() {
  return (
    <AdminSubpage title="Nový úkol" back="/admin/ukoly">
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
    </AdminSubpage>
  );
}
