"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Renders nothing. A Home Screen app coming back to the foreground shows the page as it was left;
 * fetch fresh server data so a push ("3 věci ke schválení") matches what the screen shows.
 */
export function RefreshOnResume() {
  const router = useRouter();
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [router]);
  return null;
}
