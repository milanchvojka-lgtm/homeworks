import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logoutAction } from "../actions/auth";

const TABS = [
  { href: "/child", label: "Dnes" },
  { href: "/child/pool", label: "Pool" },
  { href: "/child/me-ukoly", label: "Mé úkoly" },
  { href: "/child/kredit", label: "Kredit" },
  { href: "/child/historie", label: "Historie" },
];

export default async function ChildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/");
  if (user.role !== "CHILD") redirect("/admin");

  return (
    <div className="flex min-h-screen flex-1 flex-col pb-20">
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

      <main className="flex-1 px-6 py-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-zinc-200 bg-white/95 py-2 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="flex-1 px-2 py-2 text-center text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
