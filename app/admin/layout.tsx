import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAdminInboxCount } from "@/lib/badges";
import { BottomNav } from "../_components/bottom-nav";
import { PushSync } from "../_components/push-sync";
import { RefreshOnResume } from "../_components/refresh-on-resume";

/** Parent part (M8.6, tok varianta B; D30 Screen time tab): Schválit · Děti · Screen time · Výplaty · Víc. */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/");
  if (user.role !== "ADMIN") redirect("/child");

  const inboxCount = await getAdminInboxCount();

  return (
    <div className="flex min-h-screen flex-1 flex-col pb-24">
      {children}
      <RefreshOnResume />
      <PushSync badge={inboxCount} />
      <BottomNav
        tabs={[
          { href: "/admin", label: "Schválit", icon: "check-check", badge: inboxCount },
          { href: "/admin/deti", label: "Děti", icon: "users" },
          { href: "/admin/obrazovka", label: "Screen time", icon: "monitor-play" },
          { href: "/admin/vyplaty", label: "Výplaty", icon: "wallet" },
          {
            href: "/admin/vic",
            label: "Víc",
            icon: "menu",
            match: ["/admin/ukoly", "/admin/nepritomnost", "/admin/kompetence", "/admin/uzivatele", "/admin/nastaveni"],
          },
        ]}
      />
    </div>
  );
}
