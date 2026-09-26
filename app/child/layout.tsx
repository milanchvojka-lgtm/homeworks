import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getChildMyTasksCount, getChildPoolCount } from "@/lib/badges";
import { ChildBottomNav } from "../_components/child-bottom-nav";

export default async function ChildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/");
  if (user.role !== "CHILD") redirect("/admin");

  const [poolCount, myTasksCount] = await Promise.all([
    getChildPoolCount(user.id),
    getChildMyTasksCount(user.id),
  ]);

  return (
    <div className="flex min-h-screen flex-1 flex-col pb-24">
      {children}
      <ChildBottomNav earnBadge={poolCount + myTasksCount} />
    </div>
  );
}
