import Link from "next/link";
import {
  CalendarCheck,
  Coins,
  ListTodo,
  Inbox,
  Wallet,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

export const ACCENT = "#FF5C00";
export const ACCENT_TINT = "#FFEEDD";
export const INK = "#1A1A1A";
export const INK_2 = "#52525B";
export const INK_3 = "#71717A";
export const SOFT_BG = "#F4F4F5";
export const HAIRLINE = "#E4E4E7";

/** Family list used on the login screen; the `route` field decides
 *  where each tile sends the user, so every profile shows a distinct
 *  scenario rather than the same kid view five times. */
export type Person = {
  id: string;
  name: string;
  role: "Rodič" | "Dcera";
  color: string;
  route: string;
  blurb: string;
};

export const PEOPLE: Person[] = [
  {
    id: "milan",
    name: "Milan",
    role: "Rodič",
    color: "#3B82F6",
    route: "/preview/admin/inbox",
    blurb: "Schvalování úkolů",
  },
  {
    id: "teri",
    name: "Teri",
    role: "Rodič",
    color: "#A855F7",
    route: "/preview/admin/payouts",
    blurb: "Týdenní výplata",
  },
  {
    id: "ani",
    name: "Ani",
    role: "Dcera",
    color: "#EC4899",
    route: "/preview/ani",
    blurb: "Dnes — kuchyň",
  },
  {
    id: "emi",
    name: "Emi",
    role: "Dcera",
    color: "#10B981",
    route: "/preview/emi",
    blurb: "Extra úkoly v poolu",
  },
  {
    id: "neli",
    name: "Neli",
    role: "Dcera",
    color: "#F59E0B",
    route: "/preview/neli",
    blurb: "Kredit + historie",
  },
];

/** Linear order through the prototype tour. */
export const TOUR: { href: string; title: string }[] = [
  { href: "/preview", title: "Login" },
  { href: "/preview/ani", title: "Ani · Dnes" },
  { href: "/preview/emi", title: "Emi · Pool" },
  { href: "/preview/neli", title: "Neli · Kredit" },
  { href: "/preview/admin/inbox", title: "Milan · Inbox" },
  { href: "/preview/admin/payouts", title: "Teri · Výplata" },
];

/* ─────────────────────── Chrome ─────────────────────── */

export function TourBar({ step }: { step: number }) {
  const total = TOUR.length;
  const prev = step > 1 ? TOUR[step - 2] : TOUR[total - 1];
  const next = step < total ? TOUR[step] : TOUR[0];
  const current = TOUR[step - 1];
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-3 py-2">
      <Link
        href={prev.href}
        aria-label="Předchozí ukázka"
        className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100"
      >
        <ChevronLeft size={18} />
      </Link>
      <div className="flex flex-col items-center leading-tight">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
          Ukázka {step}/{total}
        </span>
        <span className="text-[12px] font-semibold text-zinc-800">
          {current.title}
        </span>
      </div>
      <Link
        href={next.href}
        aria-label="Další ukázka"
        className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100"
      >
        <ChevronRight size={18} />
      </Link>
    </div>
  );
}

export function MockBanner() {
  return (
    <div className="flex items-center justify-between border-b border-amber-200/70 bg-amber-50 px-4 py-1.5 text-[11px] text-amber-900">
      <span className="font-semibold tracking-[0.18em]">UKÁZKA</span>
      <span className="opacity-80">Zástupná data, nic se neukládá.</span>
    </div>
  );
}

/* ─────────────────────── Shared rows ─────────────────────── */

export function Avatar({
  person,
  size = 36,
}: {
  person: Person;
  size?: number;
}) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        backgroundColor: person.color,
        width: size,
        height: size,
        fontSize: size * 0.42,
      }}
    >
      {person.name[0]}
    </span>
  );
}

export function ProfileBar({ personId }: { personId: string }) {
  const p = PEOPLE.find((x) => x.id === personId)!;
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 bg-white px-5 py-3">
      <div className="flex items-center gap-3">
        <Avatar person={p} size={36} />
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
            Přihlášena
          </span>
          <span className="text-[14px] font-semibold text-zinc-900">
            {p.name}
          </span>
        </div>
      </div>
      <Link
        href="/preview"
        className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 hover:text-zinc-700"
      >
        Odhlásit
      </Link>
    </div>
  );
}

/* ─────────────────────── Tab nav ─────────────────────── */

type KidTabKey = "dnes" | "pool" | "ukoly" | "kredit" | "historie";

const KID_TABS: {
  key: KidTabKey;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "dnes", label: "Dnes", icon: CalendarCheck },
  { key: "pool", label: "Pool", icon: ListTodo },
  { key: "ukoly", label: "Mé úkoly", icon: CalendarCheck },
  { key: "kredit", label: "Kredit", icon: Coins },
  { key: "historie", label: "Historie", icon: Wallet },
];

export function KidTabs({ active }: { active: KidTabKey }) {
  return (
    <nav className="sticky bottom-0 grid grid-cols-5 border-t border-zinc-200 bg-white">
      {KID_TABS.map(({ key, label, icon: Icon }) => {
        const isActive = key === active;
        return (
          <button
            type="button"
            key={key}
            disabled
            title={isActive ? undefined : "V ukázce dostupné jen tato obrazovka"}
            className={`flex cursor-default flex-col items-center justify-center gap-1 py-2.5 ${
              isActive ? "" : "opacity-40"
            }`}
            style={{ color: isActive ? ACCENT : INK_3 }}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-[0.04em]">
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

type AdminTabKey = "inbox" | "payouts" | "tasks" | "settings";

const ADMIN_TABS: {
  key: AdminTabKey;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "inbox", label: "Inbox", icon: Inbox },
  { key: "payouts", label: "Výplaty", icon: Coins },
  { key: "tasks", label: "Úkoly", icon: ListTodo },
  { key: "settings", label: "Nastavení", icon: CalendarCheck },
];

export function AdminTabs({ active }: { active: AdminTabKey }) {
  return (
    <nav className="sticky bottom-0 grid grid-cols-4 border-t border-zinc-200 bg-white">
      {ADMIN_TABS.map(({ key, label, icon: Icon }) => {
        const isActive = key === active;
        return (
          <button
            type="button"
            key={key}
            disabled
            title={isActive ? undefined : "V ukázce dostupné jen tato obrazovka"}
            className={`flex cursor-default flex-col items-center justify-center gap-1 py-2.5 ${
              isActive ? "" : "opacity-40"
            }`}
            style={{ color: isActive ? ACCENT : INK_3 }}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-[0.04em]">
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
