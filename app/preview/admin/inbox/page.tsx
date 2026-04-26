import {
  ACCENT,
  AdminTabs,
  Avatar,
  PEOPLE,
  ProfileBar,
  TourBar,
} from "../../_shared";

type ItemKind = "check" | "task" | "screen";

type Item = {
  id: string;
  childId: "ani" | "emi" | "neli";
  kind: ItemKind;
  title: string;
  meta: string;
};

const inbox: Item[] = [
  {
    id: "1",
    childId: "ani",
    kind: "check",
    title: "Kuchyň · Čistá linka",
    meta: "odeslala v 11:40",
  },
  {
    id: "2",
    childId: "ani",
    kind: "check",
    title: "Kuchyň · Prázdná myčka (zpětně)",
    meta: "odeslala v 11:40",
  },
  {
    id: "3",
    childId: "ani",
    kind: "task",
    title: "Vyklidit garáž · hotovo",
    meta: "nahlásila v 16:12 · 200 Kč",
  },
  {
    id: "4",
    childId: "emi",
    kind: "check",
    title: "Obývák · Utřený stůl",
    meta: "odeslala v 9:15",
  },
  {
    id: "5",
    childId: "emi",
    kind: "task",
    title: "Mytí auta · hotovo",
    meta: "nahlásila ve 14:30 · 150 Kč",
  },
  {
    id: "6",
    childId: "neli",
    kind: "check",
    title: "Koupelna · Vyleštěné zrcadlo",
    meta: "odeslala v 18:02",
  },
  {
    id: "7",
    childId: "neli",
    kind: "screen",
    title: "Žádá 30 minut obrazovky",
    meta: "100 Kč ze zůstatku · 18:30",
  },
];

export default function AdminInbox() {
  const grouped = ["ani", "emi", "neli"].map((id) => ({
    person: PEOPLE.find((p) => p.id === id)!,
    items: inbox.filter((it) => it.childId === id),
  }));

  return (
    <>
      <TourBar step={5} />
      <ProfileBar personId="milan" />
      <main className="flex-1 px-5 py-5">
        {/* Header */}
        <div className="mb-3 flex items-baseline justify-between">
          <h1 className="text-[26px] font-semibold tracking-tight">Inbox</h1>
          <span
            className="rounded-full px-3 py-1 text-[12px] font-bold text-white"
            style={{ backgroundColor: ACCENT }}
          >
            {inbox.length} čeká
          </span>
        </div>
        <p className="mb-5 text-[12px] text-zinc-500">
          Milan i Teri vidí stejnou appku — tahle ukázka demonstruje admin
          inbox; další obrazovku (týdenní výplatu) najdeš pod profilem Teri.
        </p>

        {/* Grouped by child */}
        <div className="flex flex-col gap-5">
          {grouped.map((g) => (
            <section key={g.person.id}>
              <header className="mb-2 flex items-center gap-2">
                <Avatar person={g.person} size={28} />
                <span className="text-[14px] font-semibold">
                  {g.person.name}
                </span>
                <span className="text-[11px] font-medium text-zinc-400">
                  · {g.items.length} {g.items.length === 1 ? "položka" : "položky"}
                </span>
              </header>
              <ul className="flex flex-col gap-2">
                {g.items.map((it) => (
                  <InboxRow key={it.id} item={it} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <AdminTabs active="inbox" />
    </>
  );
}

function InboxRow({ item }: { item: Item }) {
  const kindLabel: Record<ItemKind, string> = {
    check: "Denní check",
    task: "Hlášený úkol",
    screen: "Obrazovka",
  };
  const kindColor: Record<ItemKind, string> = {
    check: "#3B82F6",
    task: "#FF5C00",
    screen: "#A855F7",
  };
  return (
    <li className="rounded-xl border border-zinc-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.15em]"
            style={{ color: kindColor[item.kind] }}
          >
            {kindLabel[item.kind]}
          </span>
          <span className="text-[14px] font-semibold leading-tight">
            {item.title}
          </span>
          <span className="text-[11px] text-zinc-500">{item.meta}</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="rounded-lg bg-zinc-900 py-2 text-[12px] font-semibold text-white"
        >
          Schválit
        </button>
        <button
          type="button"
          className="rounded-lg border border-zinc-200 bg-white py-2 text-[12px] font-semibold text-zinc-600"
        >
          Vrátit
        </button>
      </div>
    </li>
  );
}
