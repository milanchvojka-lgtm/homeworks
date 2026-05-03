"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavBadge } from "./nav-badge";

type Tab = {
  href: string;
  label: string;
  badge: number;
};

export function ChildBottomNav({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();

  // Exact match for /child, prefix match for sub-routes
  function isActive(href: string) {
    if (href === "/child") return pathname === "/child";
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-border bg-background/95 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur">
      {tabs.map((t) => {
        const active = isActive(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className="relative flex flex-1 flex-col items-center justify-center gap-0.5 px-2 py-1.5 text-center"
          >
            {/* Active indicator dot */}
            <span
              className="block h-0.5 w-4 rounded-full transition-all"
              style={
                active
                  ? { backgroundColor: "var(--chart-1)" }
                  : { backgroundColor: "transparent" }
              }
            />
            <span
              className={
                active
                  ? "flex items-center text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground"
                  : "flex items-center text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground"
              }
            >
              {t.label}
              <NavBadge count={t.badge} />
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
