import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAdminInboxCount } from "@/lib/badges";
import { logoutAction } from "../actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AdminTopNav } from "./_components/admin-top-nav";

const TABS = [
  { href: "/admin", label: "Inbox", badge: "inbox" as const },
  { href: "/admin/kompetence", label: "Kompetence" },
  { href: "/admin/ukoly", label: "Úkoly" },
  { href: "/admin/vyplaty", label: "Výplaty" },
  { href: "/admin/uzivatele", label: "Uživatelé" },
  { href: "/admin/nastaveni", label: "Nastavení" },
];

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
    <div className="flex min-h-screen flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: user.avatarColor }}
          >
            {user.name[0]}
          </div>
          <span className="text-sm font-medium">{user.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Separator orientation="vertical" className="h-5" />
          <form action={logoutAction}>
            <Button variant="ghost" size="sm" type="submit">
              Odhlásit
            </Button>
          </form>
        </div>
      </header>

      <AdminTopNav tabs={TABS} inboxCount={inboxCount} />

      <main className="flex-1 px-6 py-6">{children}</main>
    </div>
  );
}
