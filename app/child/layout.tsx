import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  getChildMyTasksCount,
  getChildOpenChecksCount,
  getChildPoolCount,
} from "@/lib/badges";
import { startOfDayPrague } from "@/lib/time";
import { BottomNav } from "../_components/bottom-nav";
import { PushSync } from "../_components/push-sync";
import { RefreshOnResume } from "../_components/refresh-on-resume";

export default async function ChildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/");
  if (user.role !== "CHILD") redirect("/admin");
  // D25: first launch — welcome first, then the child's own PIN.
  if (!user.onboardedAt) redirect("/uvitani");
  if (user.pinIsTemporary) redirect("/uvitani/pin");

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
      <RefreshOnResume />
      <PushSync badge={openChecks} />
      <BottomNav
        tabs={[
          { href: "/child", label: "Dnes", icon: "sun", badge: openChecks },
          { href: "/child/vydelat", label: "Vydělat", icon: "list-checks", badge: earnBadge },
          { href: "/child/obrazovka", label: "Screen time", icon: "monitor-play" },
          { href: "/child/ja", label: "Já", icon: "user", match: ["/child/trofeje", "/child/streak"] },
        ]}
      />
    </div>
  );
}
