/**
 * Čisté funkce z task-rotation engine — žádný DB I/O, snadno testovatelné.
 * Importuj sem jen z `task-rotation.ts` (nebo testů).
 */

export function prioritizeChildren(
  children: { id: string; rotationOrder: number | null }[],
  lastDoneByUserId: Map<string, Date>,
): string[] {
  return children
    .slice()
    .sort((a, b) => {
      const la = lastDoneByUserId.get(a.id);
      const lb = lastDoneByUserId.get(b.id);
      // Nikdy nedělal vyhrává nad těmi, kdo dělali nedávno.
      if (!la && !lb) return (a.rotationOrder ?? 0) - (b.rotationOrder ?? 0);
      if (!la) return -1;
      if (!lb) return 1;
      return la.getTime() - lb.getTime(); // starší naposledy = výš
    })
    .map((c) => c.id);
}

/** True, pokud uživatel může claimnout danou TaskInstance (bez gating na denní checky). */
export function canUserClaim(
  inst: { status: string; unlockedForUserId: string | null },
  userId: string,
): boolean {
  if (inst.status !== "AVAILABLE") return false;
  if (inst.unlockedForUserId === null) return true; // open phase
  return inst.unlockedForUserId === userId;
}

export type NextRotationState =
  | { kind: "next"; rotationIndex: number; unlockExpiresAt: Date }
  | { kind: "open"; rotationIndex: number; unlockExpiresAt: Date }
  | { kind: "expired" };

/**
 * Spočítá, co se má stát s rotation indexem po expiraci aktuálního unlocku.
 * - rotationIndex < queueLength - 1 → posun na dalšího v pořadí
 * - rotationIndex == queueLength - 1 → open phase (rotationIndex = queueLength)
 * - rotationIndex == queueLength → EXPIRED
 */
export function nextRotationState(
  current: { rotationIndex: number; queueLength: number },
  now: Date,
  claimMs: number,
): NextRotationState {
  const nextIndex = current.rotationIndex + 1;
  const unlockExpiresAt = new Date(now.getTime() + claimMs);

  if (nextIndex < current.queueLength) {
    return { kind: "next", rotationIndex: nextIndex, unlockExpiresAt };
  }
  if (nextIndex === current.queueLength) {
    return { kind: "open", rotationIndex: nextIndex, unlockExpiresAt };
  }
  return { kind: "expired" };
}
