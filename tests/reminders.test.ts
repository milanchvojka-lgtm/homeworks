import { describe, expect, it } from "vitest";
import { dueKey, pickReminder, checksLeft, type OpenCheck, screenCancelledMessage, screenRecordedMessage, taskDoneByParentMessage } from "@/lib/reminders-pure";

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

describe("pickReminder · today's role (D32)", () => {
  it("sends the role from 14:00, once, with the earliest due time", () => {
    expect(pickReminder([kitchen, bath], none, at("13:45"), "Kuchyň a stůl")).toBeNull();
    const r = pickReminder([kitchen, bath], none, at("14:05"), "Kuchyň a stůl");
    expect(r?.keys).toEqual(["role"]);
    expect(r?.message.title).toBe("Dnes máš Kuchyň a stůl");
    expect(r?.message.body).toBe("Do 17:00.");
    expect(r?.message.badge).toBe(2);
    expect(pickReminder([kitchen, bath], new Set(["role"]), at("14:30"), "Kuchyň a stůl")).toBeNull();
  });

  it("says 'do večera' without a due time and keeps the window until the evening summary", () => {
    const r = pickReminder([bath], none, at("18:50"), "Obývák");
    expect(r?.message.body).toBe("Do večera.");
    expect(pickReminder([bath], none, at("19:30"), "Obývák")?.keys).toEqual(["evening"]);
  });

  it("hands over to the due reminder: no role once it is an hour before the deadline", () => {
    expect(pickReminder([kitchen], none, at("16:05"), "Kuchyň a stůl")?.keys).toEqual([dueKey("k")]);
    expect(pickReminder([kitchen], new Set([dueKey("k")]), at("16:20"), "Kuchyň a stůl")).toBeNull();
  });

  it("sends nothing without a role or with nothing open", () => {
    expect(pickReminder([bath], none, at("15:00"))).toBeNull();
    expect(pickReminder([], none, at("15:00"), "Obývák")).toBeNull();
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

describe("taskDoneByParentMessage (D31)", () => {
  it("names the task, says no reward, opens Vydělat", () => {
    const m = taskDoneByParentMessage("Umýt okna", 0);
    expect(m.title).toBe("Úkol Umýt okna je hotový");
    expect(m.body).toBe("Dodělal ho rodič, odměna se nepřipíše.");
    expect(m.url).toBe("/child/vydelat");
    expect(m.badge).toBe(0);
  });
});
