import Link from "next/link";
import { CalendarCheck, Coins, ListTodo, type LucideIcon } from "lucide-react";

export const ACCENT = "#FF5C00";
export const ACCENT_2 = "#FF8533";
export const ACCENT_TINT = "#FFEEDD";
export const INK = "#1A1A1A";
export const INK_2 = "#666666";
export const SOFT_BG = "#F7F8FA";
export const LINE = "#EFEFEF";

export const newsreader = "font-[family-name:var(--font-newsreader)]";
export const funnel = "font-[family-name:var(--font-funnel)]";

export const PEOPLE = [
  { id: "milan", name: "Milan", role: "Rodič", color: "#3B82F6" },
  { id: "teri", name: "Teri", role: "Rodič", color: "#A855F7" },
  { id: "anicka", name: "Anička", role: "Dcera", color: "#EC4899" },
  { id: "emma", name: "Emma", role: "Dcera", color: "#10B981" },
  { id: "klara", name: "Klára", role: "Dcera", color: "#F59E0B" },
];

type TabKey = "dnes" | "pool" | "kredit";

const TABS: { key: TabKey; label: string; href: string; icon: LucideIcon }[] = [
  { key: "dnes", label: "Dnes", href: "/preview/dnes", icon: CalendarCheck },
  { key: "pool", label: "Pool", href: "/preview/pool", icon: ListTodo },
  { key: "kredit", label: "Kredit", href: "/preview/kredit", icon: Coins },
];

export function TopBar({ greeting }: { greeting: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#EFEFEF] px-6 py-4">
      <div className="flex items-center gap-3">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold text-white"
          style={{ backgroundColor: "#EC4899" }}
        >
          A
        </span>
        <div className="flex flex-col leading-tight">
          <span className={`${funnel} text-[10px] tracking-[0.2em] text-zinc-500`}>
            PŘIHLÁŠENA
          </span>
          <span className="text-[14px] font-medium">{greeting}</span>
        </div>
      </div>
      <Link
        href="/preview"
        className={`${funnel} text-[11px] font-medium tracking-[0.15em] text-zinc-500 hover:text-zinc-900`}
      >
        ODHLÁSIT
      </Link>
    </div>
  );
}

export function BottomTabs({ active }: { active: TabKey }) {
  return (
    <nav className="sticky bottom-0 grid grid-cols-3 border-t border-[#EFEFEF] bg-white">
      {TABS.map(({ key, label, href, icon: Icon }) => {
        const isActive = key === active;
        return (
          <Link
            key={key}
            href={href}
            className="flex flex-col items-center justify-center gap-1 py-3"
            style={{ color: isActive ? ACCENT : "#888" }}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span
              className={`${funnel} text-[10px] font-semibold tracking-[0.12em]`}
            >
              {label.toUpperCase()}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
