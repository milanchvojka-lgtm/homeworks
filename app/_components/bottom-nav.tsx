"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckCheck,
  ListChecks,
  Menu,
  MonitorPlay,
  Sun,
  User,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { NavBadge } from "./nav-badge";

const ICONS = {
  sun: Sun,
  "list-checks": ListChecks,
  "monitor-play": MonitorPlay,
  user: User,
  "check-check": CheckCheck,
  users: Users,
  wallet: Wallet,
  menu: Menu,
} satisfies Record<string, LucideIcon>;

export type NavTab = {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  /** Extra path prefixes that keep this tab active (subpages reached from it). */
  match?: string[];
  badge?: number;
};

/**
 * Bottom tab bar shared by the child and parent parts (pen `BottomNav`). The first tab matches its path exactly.
 * `transform-gpu` gives the fixed bar its own layer: on an iPhone SE (2022) iOS painted it into the
 * scrolling content and dragged pieces of it along with a fling.
 */
export function BottomNav({ tabs }: { tabs: NavTab[] }) {
  const pathname = usePathname();

  function isActive(tab: NavTab, index: number) {
    if (index === 0) return pathname === tab.href;
    return [tab.href, ...(tab.match ?? [])].some((p) => pathname.startsWith(p));
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex transform-gpu justify-around border-t border-border bg-card px-2 pt-1.5 pb-[max(1.125rem,env(safe-area-inset-bottom))]">
      {tabs.map((tab, i) => {
        const active = isActive(tab, i);
        const Icon = ICONS[tab.icon];
        return (
          <Link
            key={tab.href}
            href={tab.href}
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
              <NavBadge count={tab.badge ?? 0} className="absolute -top-1.5 left-4 ml-0" />
            </span>
            <span
              className={`text-xs ${active ? "font-semibold text-foreground" : "font-medium text-subtle"}`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
