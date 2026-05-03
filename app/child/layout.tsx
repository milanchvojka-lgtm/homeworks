import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getChildMyTasksCount, getChildPoolCount } from "@/lib/badges";
import { logoutAction } from "../actions/auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
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

  const tabs = [
    { href: "/child", label: "Dnes", badge: 0 },
    { href: "/child/pool", label: "Pool", badge: poolCount },
    { href: "/child/me-ukoly", label: "Mé úkoly", badge: myTasksCount },
    { href: "/child/kredit", label: "Kredit", badge: 0 },
    { href: "/child/historie", label: "Historie", badge: 0 },
  ];

  return (
    <div className="flex min-h-screen flex-1 flex-col pb-20">
      <header className="flex items-center justify-between border-b border-border px-4 py-2">
        {/* Left: avatar + name */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: user.avatarColor }}
          >
            {user.name[0]}
          </div>
          <span className="text-sm font-semibold">{user.name}</span>
        </div>

        {/* Right: settings link, theme toggle, logout */}
        <div className="flex items-center gap-1">
          <Link
            href="/child/nastaveni"
            className="inline-flex h-7 items-center rounded-lg px-2 text-[0.8rem] font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Nastavení
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <ThemeToggle />
          <Separator orientation="vertical" className="h-4" />
          <form action={logoutAction}>
            <Button variant="ghost" size="sm" type="submit" className="text-[0.8rem] font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground px-2">
              Odhlásit
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">{children}</main>

      <ChildBottomNav tabs={tabs} />
    </div>
  );
}
