import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  getChildMyTasksCount,
  getChildOpenChecksCount,
  getChildPoolCount,
} from "@/lib/badges";
import { startOfDayPrague } from "@/lib/time";
import { ChildBottomNav } from "../_components/child-bottom-nav";

export default async function ChildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/");
  if (user.role !== "CHILD") redirect("/admin");

  const [poolCount, myTasksCount, openChecks] = await Promise.all([
    getChildPoolCount(user.id),
    getChildMyTasksCount(user.id),
    getChildOpenChecksCount(user.id, startOfDayPrague()),
  ]);
  // Badges = what the child can do right now. Pool tasks are locked until today's checks are sent (D1).
  const earnBadge = myTasksCount + (openChecks === 0 ? poolCount : 0);

  return (
    <div className="flex min-h-screen flex-1 flex-col pb-24">
      {children}
      <ChildBottomNav todayBadge={openChecks} earnBadge={earnBadge} />
    </div>
  );
}
