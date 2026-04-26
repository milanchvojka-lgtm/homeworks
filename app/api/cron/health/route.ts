import { NextResponse } from "next/server";
import { PRAGUE_TZ } from "@/lib/time";

/**
 * Smoke-test endpoint pro ověření, že cron pipeline funguje:
 *   1. GitHub Actions workflow má správně nastavený `CRON_SECRET` repo secret
 *   2. Vercel deploy má matchující `CRON_SECRET` env
 *   3. Endpoint dosažitelný z GitHub Actions hostů
 *   4. Vercel runtime má `TZ=Europe/Prague`
 *
 * Pattern použitý zde se replikuje pro všechny `/api/cron/*` joby v M2+:
 * vždy nejdřív ověření `Authorization: Bearer <CRON_SECRET>` headeru,
 * pak vlastní práce, pak ověření okna v Europe/Prague (DST safety).
 */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET
    ? `Bearer ${process.env.CRON_SECRET}`
    : null;

  if (!expected || auth !== expected) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  const now = new Date();
  return NextResponse.json(
    {
      status: "ok",
      nowUtc: now.toISOString(),
      // Server runtime na Vercelu je vždy UTC (TZ je rezervovaná systémová
      // proměnná). Náš kód si timezone explicitně předává přes `appTz`
      // konstantu (lib/time.ts), takže to nezáleží.
      nowPrague: now.toLocaleString("cs-CZ", { timeZone: PRAGUE_TZ }),
      appTz: PRAGUE_TZ,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
