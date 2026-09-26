"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { THEME_COOKIE, parseThemePref, type ThemePref } from "@/lib/theme";

/** Store the appearance preference (D17 update). Device-level setting, no user check needed. */
export async function setThemeAction(pref: ThemePref): Promise<{ ok: true }> {
  const jar = await cookies();
  const value = parseThemePref(pref);
  if (value === "system") jar.delete(THEME_COOKIE);
  else
    jar.set(THEME_COOKIE, value, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365 * 2,
    });
  revalidatePath("/", "layout");
  return { ok: true };
}
