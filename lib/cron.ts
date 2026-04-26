import "server-only";
import { NextResponse } from "next/server";

/**
 * Ověří `Authorization: Bearer <CRON_SECRET>` hlavičku.
 * Vrací NextResponse s 401, pokud auth selže — jinak null.
 */
export function checkCronAuth(request: Request): NextResponse | null {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  const expected = secret ? `Bearer ${secret}` : null;

  if (!expected || auth !== expected) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }
  return null;
}
