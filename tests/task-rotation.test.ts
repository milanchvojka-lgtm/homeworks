import { describe, expect, it } from "vitest";
import {
  canUserClaim,
  nextRotationState,
  prioritizeChildren,
} from "@/lib/task-rotation-pure";

describe("prioritizeChildren", () => {
  const A = { id: "A", rotationOrder: 1 };
  const B = { id: "B", rotationOrder: 2 };
  const C = { id: "C", rotationOrder: 3 };

  it("when nobody did the task: order by rotationOrder", () => {
    expect(prioritizeChildren([C, A, B], new Map())).toEqual(["A", "B", "C"]);
  });

  it("never-done beats anyone who has done it", () => {
    const last = new Map<string, Date>([["A", new Date("2026-01-01")]]);
    expect(prioritizeChildren([A, B, C], last)).toEqual(["B", "C", "A"]);
  });

  it("among those who did it, oldest doneAt wins", () => {
    const last = new Map<string, Date>([
      ["A", new Date("2026-01-10")],
      ["B", new Date("2026-01-05")],
      ["C", new Date("2026-01-15")],
    ]);
    expect(prioritizeChildren([A, B, C], last)).toEqual(["B", "A", "C"]);
  });

  it("doesn't mutate input array", () => {
    const arr = [B, A, C];
    prioritizeChildren(arr, new Map());
    expect(arr.map((x) => x.id)).toEqual(["B", "A", "C"]);
  });
});

describe("canUserClaim", () => {
  it("denies non-AVAILABLE", () => {
    expect(
      canUserClaim({ status: "CLAIMED", unlockedForUserId: "A" }, "A"),
    ).toBe(false);
  });

  it("allows when unlocked exactly for me", () => {
    expect(
      canUserClaim({ status: "AVAILABLE", unlockedForUserId: "A" }, "A"),
    ).toBe(true);
  });

  it("denies when unlocked for someone else", () => {
    expect(
      canUserClaim({ status: "AVAILABLE", unlockedForUserId: "B" }, "A"),
    ).toBe(false);
  });

  it("allows anyone in open phase", () => {
    expect(
      canUserClaim({ status: "AVAILABLE", unlockedForUserId: null }, "A"),
    ).toBe(true);
  });
});

describe("nextRotationState", () => {
  const NOW = new Date("2026-04-26T12:00:00Z");
  const CLAIM_MS = 24 * 60 * 60 * 1000;

  it("at index 0 of queue length 3 → next index 1", () => {
    const r = nextRotationState({ rotationIndex: 0, queueLength: 3 }, NOW, CLAIM_MS);
    expect(r.kind).toBe("next");
    if (r.kind === "next") {
      expect(r.rotationIndex).toBe(1);
      expect(r.unlockExpiresAt.getTime()).toBe(NOW.getTime() + CLAIM_MS);
    }
  });

  it("at last index of queue → open phase", () => {
    const r = nextRotationState({ rotationIndex: 2, queueLength: 3 }, NOW, CLAIM_MS);
    expect(r.kind).toBe("open");
    if (r.kind === "open") {
      expect(r.rotationIndex).toBe(3);
    }
  });

  it("after open phase → expired", () => {
    const r = nextRotationState({ rotationIndex: 3, queueLength: 3 }, NOW, CLAIM_MS);
    expect(r.kind).toBe("expired");
  });

  it("queue length 1: index 0 → open, index 1 → expired", () => {
    expect(
      nextRotationState({ rotationIndex: 0, queueLength: 1 }, NOW, CLAIM_MS).kind,
    ).toBe("open");
    expect(
      nextRotationState({ rotationIndex: 1, queueLength: 1 }, NOW, CLAIM_MS).kind,
    ).toBe("expired");
  });

  it("empty queue → goes straight to open then expired", () => {
    const open = nextRotationState({ rotationIndex: -1, queueLength: 0 }, NOW, CLAIM_MS);
    expect(open.kind).toBe("open");
    expect(
      nextRotationState({ rotationIndex: 0, queueLength: 0 }, NOW, CLAIM_MS).kind,
    ).toBe("expired");
  });
});
