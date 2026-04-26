import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getCurrentAssignment } from "@/lib/rotation";
import { startOfDayPrague } from "@/lib/time";
import { TodayChecks } from "./_components/today-checks";

export default async function ChildToday() {
  const user = await getSession();
  if (!user) redirect("/");

  const today = startOfDayPrague();
  const assignment = await getCurrentAssignment(user.id);
  const instances = await db.dailyCheckInstance.findMany({
    where: { userId: user.id, date: today },
    include: { dailyCheck: true },
    orderBy: [{ dailyCheck: { order: "asc" } }],
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dnes</h1>
      {assignment ? (
        <p className="mt-1 text-sm text-zinc-500">
          Tento týden:{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {assignment.competency.name}
          </span>
        </p>
      ) : (
        <p className="mt-1 text-sm text-zinc-500">
          Tento týden nemáš přiřazenou kompetenci.
        </p>
      )}

      <div className="mt-6">
        {instances.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Žádné checky pro dnešek. Zkontroluj to později.
          </p>
        ) : (
          <TodayChecks
            instances={instances.map((i) => ({
              id: i.id,
              name: i.dailyCheck.name,
              timeOfDay: i.dailyCheck.timeOfDay,
              status: i.status,
              note: i.note,
            }))}
          />
        )}
      </div>
    </div>
  );
}
