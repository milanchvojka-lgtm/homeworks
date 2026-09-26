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

/** Four tabs (návrh 2, pen `BottomNav`). Badges = what the child can do now: open checks on Dnes, takeable + active tasks on Vydělat. */
export function ChildBottomNav({
  todayBadge,
  earnBadge,
}: {
  todayBadge: number;
  earnBadge: number;
}) {
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
            {/* Badge sits on the icon's corner, out of flow, so the icon stays centred. */}
            <span className="relative">
              <Icon
                className={`size-[22px] ${active ? "text-foreground" : "text-subtle"}`}
              />
              <NavBadge
                count={href === "/child" ? todayBadge : href === "/child/vydelat" ? earnBadge : 0}
                className="absolute -top-1.5 left-4 ml-0"
              />
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
