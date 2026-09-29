"use client";

import { useEffect } from "react";
import { syncPush } from "@/lib/push-client";

/**
 * D28: renders nothing. On app open and whenever the count changes it refreshes the push subscription
 * and the number on the app icon (child: open checks today, parent: waiting for approval).
 */
export function PushSync({ badge }: { badge: number }) {
  useEffect(() => {
    syncPush(badge).catch((err) => console.error("push: sync failed", err));
  }, [badge]);
  return null;
}
