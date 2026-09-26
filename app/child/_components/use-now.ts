"use client";

import { useEffect, useState } from "react";

/** Current time, starting from the server's `initialIso` (no hydration mismatch), ticking every 30 s. */
export function useNow(initialIso: string): Date {
  const [now, setNow] = useState(() => new Date(initialIso));
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}
