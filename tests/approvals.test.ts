import { describe, expect, it } from "vitest";
import { clearedByOther, formatAgo } from "@/lib/approvals-pure";
import { inboxClearedMessage } from "@/lib/reminders-pure";

const at = (hhmm: string) => new Date(`2026-10-05T${hhmm}:00+02:00`);
const MILAN = { id: "m", name: "Milan" };
const TEREZA = { id: "t", name: "Tereza" };

describe("inboxClearedMessage (D37)", () => {
  it("replaces the approvals notification and resets the icon number", () => {
    expect(inboxClearedMessage("Tereza")).toEqual({
      title: "Vše vyřízeno ✓",
      body: "Tereza · ke schválení nic nevisí",
      url: "/admin",
      tag: "approvals",
      badge: 0,
    });
  });
});

describe("clearedByOther (D37)", () => {
  it("nothing reviewed today → null", () => {
    expect(clearedByOther([], MILAN.id)).toBeNull();
  });

  it("the viewer cleared it themselves → null", () => {
    expect(clearedByOther([{ reviewer: MILAN, reviewedAt: at("10:00") }], MILAN.id)).toBeNull();
  });

  it("counts the other parent's items after the viewer's last one", () => {
    const r = clearedByOther(
      [
        { reviewer: TEREZA, reviewedAt: at("09:00") },
        { reviewer: MILAN, reviewedAt: at("10:00") },
        { reviewer: TEREZA, reviewedAt: at("18:01") },
        { reviewer: TEREZA, reviewedAt: at("18:03") },
        { reviewer: TEREZA, reviewedAt: at("18:02") },
      ],
      MILAN.id,
    );
    expect(r).toEqual({ count: 3, name: "Tereza", at: at("18:03") });
  });
});

describe("formatAgo", () => {
  const now = at("18:30");
  it("under a minute", () => expect(formatAgo(at("18:30"), now)).toBe("před chvílí"));
  it("minutes", () => expect(formatAgo(at("18:20"), now)).toBe("před 10 min"));
  it("an hour and more → clock time", () => expect(formatAgo(at("09:05"), now)).toBe("v 09:05"));
});
