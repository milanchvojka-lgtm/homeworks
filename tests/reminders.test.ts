import { describe, expect, it } from "vitest";
import { dueKey, pickReminder, checksLeft, type OpenCheck, screenCancelledMessage, screenRecordedMessage } from "@/lib/reminders-pure";

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
    expect(r?.message.title).toBe("Blíží se termín");
    expect(r?.message.body).toBe("Do 17:00 ti zbývá 1 povinnost. Odškrtni to, ať nepřijdeš o řadu.");
    expect(r?.message.badge).toBe(2);
  });

  it("does not repeat the due reminder and skips it once the due time passed", () => {
    expect(pickReminder([kitchen], new Set([dueKey("k")]), at("16:30"))).toBeNull();
    expect(pickReminder([kitchen], none, at("17:10"))).toBeNull();
  });

  it("sends the evening summary once, listing everything open", () => {
    const r = pickReminder([kitchen, bath], none, at("19:30"));
    expect(r?.keys).toEqual(["evening"]);
    expect(r?.message.body).toBe("Zbývají ti 2 povinnosti. Odškrtni to do půlnoci, ať nepřijdeš o řadu.");
    expect(r?.message.body).not.toContain("Linka");
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
    expect(r?.message.body).toContain("Do 17:00 ti zbývají 2 povinnosti");
  });
});

describe("checksLeft", () => {
  it("uses the Czech plural", () => {
    expect(checksLeft(1)).toEqual(["zbývá", "1 povinnost"]);
    expect(checksLeft(3)).toEqual(["zbývají", "3 povinnosti"]);
    expect(checksLeft(5)).toEqual(["zbývá", "5 povinností"]);
  });
});

describe("D30 screen time pushes", () => {
  it("recorded: minutes and cost, opens Screen time", () => {
    const m = screenRecordedMessage(15, 50, 2);
    expect(m.title).toBe("Zapsáno 15 min screen time");
    expect(m.body).toBe("−50 Kč z tvého kreditu.");
    expect(m.url).toBe("/child/obrazovka");
    expect(m.badge).toBe(2);
  });
  it("an hour reads as 1 h", () => {
    expect(screenRecordedMessage(60, 200, 0).title).toBe("Zapsáno 1 h screen time");
  });
  it("cancelled: money back", () => {
    const m = screenCancelledMessage(60, 200, 0);
    expect(m.title).toBe("Zápis 1 h zrušen");
    expect(m.body).toBe("+200 Kč zpět.");
  });
});
