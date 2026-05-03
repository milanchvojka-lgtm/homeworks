"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavBadge } from "@/app/_components/nav-badge";

type Tab = {
  href: string;
  label: string;
  badge?: "inbox";
};

type Props = {
  tabs: Tab[];
  inboxCount: number;
};

export function AdminTopNav({ tabs, inboxCount }: Props) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border px-4 text-sm">
      {tabs.map((t) => {
        const active = isActive(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className="relative flex flex-col items-center whitespace-nowrap pt-2 pb-0"
          >
            {/* Active indicator bar at top */}
            <span
              className="mb-1.5 block h-0.5 w-full rounded-full transition-all"
              style={
                active
                  ? { backgroundColor: "var(--chart-1)" }
                  : { backgroundColor: "transparent" }
              }
            />
            <span
              className={[
                "mb-2 flex items-center rounded-md px-3 py-1",
                active
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {t.label}
              {t.badge === "inbox" && <NavBadge count={inboxCount} />}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
