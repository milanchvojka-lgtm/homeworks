/** Appearance preference (D17 update): "system" follows the phone, stored in a cookie. */
export type ThemePref = "system" | "light" | "dark";

export const THEME_COOKIE = "hw_theme";

export function parseThemePref(value: string | undefined): ThemePref {
  return value === "light" || value === "dark" ? value : "system";
}
