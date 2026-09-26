"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListChecks, MonitorPlay, Sun, User } from "lucide-react";
import { NavBadge } from "./nav-badge";

const TABS = [
  { href: "/child", label: "Dnes", Icon: Sun },
  { href: "/child/vydelat", label: "Vydělat", Icon: ListChecks },
  { href: "/child/obrazovka", label: "Obrazovka", Icon: MonitorPlay },
  { href: "/child/ja", label: "Já", Icon: User },
] as const;

/** Four tabs (návrh 2, pen `BottomNav`). Badge on Vydělat = tasks I can take + my active tasks. */
export function ChildBottomNav({ earnBadge }: { earnBadge: number }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/child") return pathname === "/child";
    if (href === "/child/ja")
      return ["/child/ja", "/child/trofeje", "/child/streak"].some((p) =>
        pathname.startsWith(p),
      );
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-border bg-card px-2 pt-1.5 pb-[max(1.125rem,env(safe-area-inset-bottom))]">
      {TABS.map(({ href, label, Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className="flex min-h-12 w-20 flex-col items-center gap-[3px]"
          >
            <span
              className={`h-0.5 w-[18px] rounded-full ${active ? "bg-highlight" : "bg-transparent"}`}
            />
            <span className="flex items-start">
              <Icon
                className={`size-[22px] ${active ? "text-foreground" : "text-subtle"}`}
              />
              {href === "/child/vydelat" && <NavBadge count={earnBadge} />}
            </span>
            <span
              className={`text-xs ${active ? "font-semibold text-foreground" : "font-medium text-subtle"}`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
