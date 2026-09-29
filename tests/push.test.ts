import { beforeEach, describe, expect, it, vi } from "vitest";

// lib/push is server-only DB I/O; the transport and DB are mocked so the delivery rules can be tested (D28).
vi.mock("server-only", () => ({}));
const send = vi.fn();
vi.mock("web-push", () => ({ default: { setVapidDetails: vi.fn(), sendNotification: (...a: unknown[]) => send(...a) } }));
const update = vi.fn(async (...args: unknown[]) => args && {});
const findMany = vi.fn();
vi.mock("@/lib/db", () => ({ db: { pushSubscription: { findMany: (...a: unknown[]) => findMany(...a), update: (...a: unknown[]) => update(...a) } } }));

const msg = { title: "t", body: "b", url: "/child", tag: "reminder", badge: 1 };
const sub = (id: string) => ({ id, endpoint: `https://push/${id}`, p256dh: "p", auth: "a" });

async function load(withKeys: boolean) {
  vi.resetModules();
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = withKeys ? "pub" : "";
  process.env.VAPID_PRIVATE_KEY = withKeys ? "priv" : "";
  process.env.VAPID_SUBJECT = withKeys ? "mailto:x@y" : "";
  return import("@/lib/push");
}

describe("sendPush", () => {
  beforeEach(() => {
    send.mockReset();
    update.mockClear();
    findMany.mockReset();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("sends nothing without VAPID keys and says so", async () => {
    const { sendPush, pushConfigured } = await load(false);
    expect(pushConfigured()).toBe(false);
    expect(await sendPush(["u"], msg)).toBe(0);
    expect(findMany).not.toHaveBeenCalled();
  });

  it("counts delivered devices and records the success", async () => {
    const { sendPush } = await load(true);
    findMany.mockResolvedValue([sub("a"), sub("b")]);
    send.mockResolvedValue({});
    expect(await sendPush(["u"], msg)).toBe(2);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ data: { lastSuccessAt: expect.any(Date) } }));
  });

  it("disables a dead subscription (410) and keeps others", async () => {
    const { sendPush } = await load(true);
    findMany.mockResolvedValue([sub("dead"), sub("ok")]);
    send.mockImplementation(async (s: { endpoint: string }) => {
      if (s.endpoint.endsWith("dead")) throw Object.assign(new Error("gone"), { statusCode: 410 });
      return {};
    });
    expect(await sendPush(["u"], msg)).toBe(1);
    expect(update).toHaveBeenCalledWith({ where: { id: "dead" }, data: { disabledAt: expect.any(Date) } });
  });

  it("never throws on other errors and keeps the subscription", async () => {
    const { sendPush } = await load(true);
    findMany.mockResolvedValue([sub("a")]);
    send.mockRejectedValue(Object.assign(new Error("boom"), { statusCode: 500 }));
    expect(await sendPush(["u"], msg)).toBe(0);
    expect(update).not.toHaveBeenCalledWith(expect.objectContaining({ data: { disabledAt: expect.any(Date) } }));
  });

  it("never throws when the database fails", async () => {
    const { sendPush } = await load(true);
    findMany.mockRejectedValue(new Error("db down"));
    expect(await sendPush(["u"], msg)).toBe(0);
  });
});
