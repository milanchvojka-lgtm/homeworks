"use client";

import { useState, useTransition } from "react";
import { claimTaskAction } from "@/app/actions/tasks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-8">
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
      <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground">{text}</p>;
}

function TaskHeader({ item }: { item: Item }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{item.name}</div>
        <div
          className="text-sm font-bold tabular-nums"
          style={{ color: "var(--chart-1)" }}
        >
          {item.valueCzk} Kč
        </div>
      </div>
      {item.description && (
        <div className="mt-1 text-xs text-muted-foreground">
          {item.description}
        </div>
      )}
      {item.timeEstimateMinutes && (
        <div className="mt-1 text-xs text-muted-foreground">
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
    <Card>
      <CardContent className="pt-4 pb-4">
        <TaskHeader item={item} />
        <div className="mt-2 text-xs text-muted-foreground">
          {item.unlockedForUserId === null
            ? "Otevřeno všem"
            : "Otevřeno pro tebe"}
          {item.unlockExpiresAt && (
            <> • do {formatTime(item.unlockExpiresAt)}</>
          )}
        </div>

        {error && <div className="mt-2 text-xs text-destructive">{error}</div>}

        {!confirming ? (
          <Button
            className="mt-3 w-full"
            onClick={() => setConfirming(true)}
            disabled={!canClaim || isPending}
          >
            Vzít si
          </Button>
        ) : (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground">
              Po potvrzení máš omezený čas na dokončení.
            </p>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={claim}
                disabled={isPending}
              >
                Beru
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirming(false)}
                disabled={isPending}
              >
                Zpátky
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LockedCard({ item }: { item: Item }) {
  return (
    <Card className="opacity-80">
      <CardContent className="pt-4 pb-4">
        <TaskHeader item={item} />
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
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
          {item.unlockExpiresAt && (
            <> • do {formatTime(item.unlockExpiresAt)}</>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingCard({ item }: { item: Item }) {
  return (
    <Card className="opacity-70">
      <CardContent className="pt-4 pb-4">
        <TaskHeader item={item} />
        <div className="mt-2 text-xs text-muted-foreground tabular-nums">
          {item.queuePosition >= 0
            ? `Tvoje pozice v rotaci: ${item.queuePosition + 1}.`
            : "Pošle se ti, až přijde řada."}
        </div>
      </CardContent>
    </Card>
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
