"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCheck } from "lucide-react";
import { approveCheckAction, rejectCheckAction } from "@/app/actions/checks";
import { approveTaskAction, rejectTaskAction } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/app/_components/empty-state";

export type ApprovalItem = {
  id: string;
  kind: "check" | "task";
  title: string;
  meta: string;
};

export type ApprovalGroup = {
  user: { id: string; name: string; avatarColor: string };
  items: ApprovalItem[];
};

type RowState = "done" | "handled";

/** Schválit (pen HWR · 01): waiting items grouped by child, approve in one tap, return opens a note. */
export function ApprovalList({ groups, clearedText }: { groups: ApprovalGroup[]; clearedText?: string }) {
  const router = useRouter();
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<{ id: string; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const finish = (id: string, res: { ok: boolean; error?: string }) => {
    if (res.ok) {
      setRows((r) => ({ ...r, [id]: "done" }));
      setRejectingId(null);
      setNote("");
      router.refresh();
    } else if (res.error === "invalid_state") {
      // The other parent handled it in the meantime.
      setRows((r) => ({ ...r, [id]: "handled" }));
      setRejectingId(null);
    } else {
      setError({ id, text: "Nepovedlo se, zkus to znovu." });
    }
  };

  const approve = (i: ApprovalItem) =>
    startTransition(async () => {
      setError(null);
      const res = i.kind === "check" ? await approveCheckAction(i.id) : await approveTaskAction(i.id);
      finish(i.id, res);
    });

  const reject = (i: ApprovalItem) =>
    startTransition(async () => {
      setError(null);
      const res =
        i.kind === "check" ? await rejectCheckAction(i.id, note) : await rejectTaskAction(i.id, note);
      finish(i.id, res);
    });

  const visible = groups
    .map((g) => ({ ...g, items: g.items.filter((i) => rows[i.id] !== "done") }))
    .filter((g) => g.items.length > 0);

  if (visible.length === 0) return <NothingWaiting text={clearedText} />;

  return (
    <div className="flex flex-col gap-3">
      {visible.map((g) => (
        <section key={g.user.id} className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-0.5 pt-1">
            <span
              className="flex size-6 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: g.user.avatarColor }}
            >
              {g.user.name[0]}
            </span>
            <span className="text-[15px] font-semibold">{g.user.name}</span>
            <span className="font-mono text-[13px] font-bold text-subtle">
              {g.items.filter((i) => rows[i.id] !== "handled").length}
            </span>
          </div>
          {g.items.map((i) =>
            rows[i.id] === "handled" ? (
              <div
                key={i.id}
                className="flex items-center gap-2.5 rounded-tile bg-muted px-[18px] py-4"
              >
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-lg font-bold tracking-tight text-muted-foreground">
                    {i.title}
                  </span>
                  <span className="font-mono text-xs font-bold text-muted-foreground">
                    Už vyřízeno
                  </span>
                </div>
                <Check className="size-5 text-success" />
              </div>
            ) : (
              <ApprovalRow
                key={i.id}
                item={i}
                returning={rejectingId === i.id}
                note={note}
                onNote={setNote}
                pending={isPending}
                failed={error?.id === i.id ? error.text : null}
                onApprove={() => approve(i)}
                onStartReturn={() => {
                  setNote("");
                  setRejectingId(i.id);
                }}
                onCancelReturn={() => setRejectingId(null)}
                onReturn={() => reject(i)}
              />
            ),
          )}
        </section>
      ))}
    </div>
  );
}

/** Pen `ApprovalRow` / `ApprovalRow · vracení`. */
function ApprovalRow({
  item,
  returning,
  note,
  onNote,
  pending,
  failed,
  onApprove,
  onStartReturn,
  onCancelReturn,
  onReturn,
}: {
  item: ApprovalItem;
  returning: boolean;
  note: string;
  onNote: (v: string) => void;
  pending: boolean;
  failed: string | null;
  onApprove: () => void;
  onStartReturn: () => void;
  onCancelReturn: () => void;
  onReturn: () => void;
}) {
  return (
    <div
      className={`flex flex-col gap-3.5 rounded-tile border bg-card px-[18px] pt-4 pb-[18px] ${returning ? "border-foreground" : "border-border"}`}
    >
      <div className="flex flex-col gap-1">
        <span className="text-lg leading-tight font-bold tracking-tight">{item.title}</span>
        <span className="font-mono text-xs font-bold text-muted-foreground">{item.meta}</span>
      </div>
      {returning && (
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] font-bold tracking-wider text-subtle uppercase">
            Proč vracíš
          </span>
          <Input
            value={note}
            onChange={(e) => onNote(e.target.value)}
            placeholder="Třeba: drobky pod stolem"
            autoFocus
          />
        </label>
      )}
      {failed && <p className="text-sm text-destructive">{failed}</p>}
      <div className="flex gap-2.5">
        {returning ? (
          <>
            <Button variant="outline" className="h-12 flex-1" onClick={onCancelReturn} disabled={pending}>
              Zrušit
            </Button>
            <Button className="flex-1" onClick={onReturn} disabled={pending}>
              Vrátit s poznámkou
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" className="h-12 flex-1" onClick={onStartReturn} disabled={pending}>
              Vrátit
            </Button>
            <Button className="flex-1" onClick={onApprove} disabled={pending}>
              Schválit
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

/** Pen HWR · 01c; with `text` pen HWV · 01 (D37: the other parent emptied the queue). */
export function NothingWaiting({ text }: { text?: string }) {
  return (
    <EmptyState
      Icon={CheckCheck}
      tone="success"
      title="Nic nevisí"
      text={text ?? "Všechno, co holky nahlásily, je vyřízené."}
      className="flex-1 py-24"
    />
  );
}
