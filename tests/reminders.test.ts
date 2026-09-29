import { describe, expect, it } from "vitest";
import { dueKey, pickReminder, type OpenCheck } from "@/lib/reminders-pure";

// 2026-09-29 is summer time in Prague (UTC+2): 19:30 Prague = 17:30 UTC.
const at = (prague: string) => new Date(`2026-09-29T${prague}:00+02:00`);
const kitchen: OpenCheck = { dailyCheckId: "k", name: "Linka prázdná", dueTime: "17:00" };
const bath: OpenCheck = { dailyCheckId: "b", name: "Koupelna", dueTime: null };
const none = new Set<string>();

describe("pickReminder", () => {
  it("sends nothing when nothing is open", () => {
    expect(pickReminder([], none, at("19:45"))).toBeNull();
    expect(pickReminder([], none, at("21:45"))).toBeNull();
  });

  it("sends nothing in the morning", () => {
    expect(pickReminder([kitchen, bath], none, at("08:00"))).toBeNull();
  });

  it("reminds 60 min before the due time", () => {
    const r = pickReminder([kitchen, bath], none, at("16:05"));
    expect(r?.keys).toEqual([dueKey("k")]);
    expect(r?.message.title).toBe("Zbývá ti Linka prázdná");
    expect(r?.message.badge).toBe(2);
  });

  it("does not repeat the due reminder and skips it once the due time passed", () => {
    expect(pickReminder([kitchen], new Set([dueKey("k")]), at("16:30"))).toBeNull();
    expect(pickReminder([kitchen], none, at("17:10"))).toBeNull();
  });

  it("sends the evening summary once, listing everything open", () => {
    const r = pickReminder([kitchen, bath], none, at("19:30"));
    expect(r?.keys).toEqual(["evening"]);
    expect(r?.message.body).toContain("Linka prázdná, Koupelna");
    expect(pickReminder([kitchen, bath], new Set(["evening"]), at("20:15"))).toBeNull();
  });

  it("skips a stale evening summary when the cron runs late, sends last chance once", () => {
    const r = pickReminder([bath], none, at("21:40"));
    expect(r?.keys).toEqual(["last"]);
    expect(pickReminder([bath], new Set(["last"]), at("23:00"))).toBeNull();
  });

  it("merges checks due at the same time into one push", () => {
    const linka: OpenCheck = { dailyCheckId: "l", name: "Linka", dueTime: "17:00" };
    const r = pickReminder([kitchen, linka], none, at("16:15"));
    expect(r?.keys).toEqual([dueKey("k"), dueKey("l")]);
    expect(r?.message.title).toBe("Blíží se termín");
  });
});
