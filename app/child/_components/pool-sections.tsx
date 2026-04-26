"use client";

import { useState, useTransition } from "react";
import { claimTaskAction } from "@/app/actions/tasks";

type Item = {
  id: string;
  name: string;
  description: string | null;
  valueCzk: number;
  timeEstimateMinutes: number | null;
  unlockedForUserId: string | null;
  unlockExpiresAt: string | null;
  unlockedForName: string | null;
  unlockedForColor: string | null;
  queuePosition: number;
};

export function PoolSections({
  canClaim,
  myItems,
  lockedItems,
  upcomingItems,
}: {
  canClaim: boolean;
  myItems: Item[];
  lockedItems: Item[];
  upcomingItems: Item[];
}) {
  return (
    <div className="mt-6 space-y-8">
      <Section title="Můžu vzít teď">
        {myItems.length === 0 ? (
          <Empty text="Žádné dostupné úkoly." />
        ) : (
          myItems.map((i) => (
            <ClaimableCard key={i.id} item={i} canClaim={canClaim} />
          ))
        )}
      </Section>

      <Section title="Zamčeno (čeká na sourozenku)">
        {lockedItems.length === 0 ? (
          <Empty text="Nic zamčeného." />
        ) : (
          lockedItems.map((i) => <LockedCard key={i.id} item={i} />)
        )}
      </Section>

      <Section title="Brzy dostupné">
        {upcomingItems.length === 0 ? (
          <Empty text="Nic dalšího v pořadí." />
        ) : (
          upcomingItems.map((i) => <UpcomingCard key={i.id} item={i} />)
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-zinc-500">{text}</p>;
}

function CardShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${className} border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900`}
    >
      {children}
    </div>
  );
}

function TaskHeader({ item }: { item: Item }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{item.name}</div>
        <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          {item.valueCzk} Kč
        </div>
      </div>
      {item.description && (
        <div className="mt-1 text-xs text-zinc-500">{item.description}</div>
      )}
      {item.timeEstimateMinutes && (
        <div className="mt-1 text-xs text-zinc-500">
          ~{item.timeEstimateMinutes} min
        </div>
      )}
    </div>
  );
}

function ClaimableCard({
  item,
  canClaim,
}: {
  item: Item;
  canClaim: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const claim = () => {
    setError(null);
    startTransition(async () => {
      const res = await claimTaskAction(item.id);
      if (!res.ok) {
        setError(
          res.error === "daily_checks_pending"
            ? "Nejdřív dokonči dnešní kompetenci."
            : res.error === "race"
              ? "Někdo to vzal dřív."
              : "Nepovedlo se vzít úkol.",
        );
        setConfirming(false);
      }
    });
  };

  return (
    <CardShell>
      <TaskHeader item={item} />
      <div className="mt-2 text-xs text-zinc-500">
        {item.unlockedForUserId === null
          ? "Otevřeno všem"
          : "Otevřeno pro tebe"}
        {item.unlockExpiresAt && (
          <> • do {formatTime(item.unlockExpiresAt)}</>
        )}
      </div>

      {error && <div className="mt-2 text-xs text-red-600">{error}</div>}

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          disabled={!canClaim || isPending}
          className="mt-3 w-full rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Vzít si
        </button>
      ) : (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-zinc-500">
            Po potvrzení máš omezený čas na dokončení.
          </p>
          <div className="flex gap-2">
            <button
              onClick={claim}
              disabled={isPending}
              className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              Beru
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={isPending}
              className="flex-1 rounded-lg border border-zinc-300 py-2 text-sm dark:border-zinc-700"
            >
              Zpátky
            </button>
          </div>
        </div>
      )}
    </CardShell>
  );
}

function LockedCard({ item }: { item: Item }) {
  return (
    <CardShell className="opacity-80">
      <TaskHeader item={item} />
      <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
        {item.unlockedForName && (
          <>
            <div
              className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold text-white"
              style={{ backgroundColor: item.unlockedForColor ?? "#888" }}
            >
              {item.unlockedForName[0]}
            </div>
            <span>Čeká na {item.unlockedForName}</span>
          </>
        )}
        {item.unlockExpiresAt && <> • do {formatTime(item.unlockExpiresAt)}</>}
      </div>
    </CardShell>
  );
}

function UpcomingCard({ item }: { item: Item }) {
  return (
    <CardShell className="opacity-70">
      <TaskHeader item={item} />
      <div className="mt-2 text-xs text-zinc-500">
        {item.queuePosition >= 0
          ? `Tvoje pozice v rotaci: ${item.queuePosition + 1}.`
          : "Pošle se ti, až přijde řada."}
      </div>
    </CardShell>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("cs-CZ", {
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
