import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAdminInboxCount } from "@/lib/badges";
import { logoutAction } from "../actions/auth";
import { NavBadge } from "../_components/nav-badge";

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
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: user.avatarColor }}
          >
            {user.name[0]}
          </div>
          <span className="text-sm font-medium">{user.name}</span>
        </div>
        <form action={logoutAction}>
          <button className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
            Odhlásit
          </button>
        </form>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-zinc-200 px-4 py-2 text-sm dark:border-zinc-800">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="flex items-center whitespace-nowrap rounded-md px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            {t.label}
            {t.badge === "inbox" && <NavBadge count={inboxCount} />}
          </Link>
        ))}
      </nav>

      <main className="flex-1 px-6 py-6">{children}</main>
    </div>
  );
}
