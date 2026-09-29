"use client";

import { disablePushSubscriptionAction, savePushSubscriptionAction } from "@/app/actions/push";

/** D28: what the reminders switch shows. */
export type PushState =
  | "unsupported" // not the Home Screen app (Safari tab) or an old iOS
  | "off" // never asked on this device
  | "on"
  | "blocked"; // denied — only iOS Settings can turn it back on

function supported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!supported()) return null;
  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
    return await navigator.serviceWorker.ready;
  } catch (err) {
    console.error("push: service worker registration failed", err);
    return null;
  }
}

export async function getPushState(): Promise<PushState> {
  if (!supported()) return "unsupported";
  if (Notification.permission === "denied") return "blocked";
  if (Notification.permission !== "granted") return "off";
  const reg = await registerServiceWorker();
  const sub = await reg?.pushManager.getSubscription();
  return sub ? "on" : "off";
}

function vapidKey(): Uint8Array<ArrayBuffer> {
  const base64 = (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "").replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function subscribe(reg: ServiceWorkerRegistration): Promise<boolean> {
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidKey() }));
  const res = await savePushSubscriptionAction(sub.toJSON());
  return res.ok;
}

/** Turn reminders on. Must run from a tap — iOS asks for permission only after a user gesture. */
export async function enablePush(): Promise<PushState> {
  if (!supported()) return "unsupported";
  const permission = await Notification.requestPermission();
  if (permission === "denied") return "blocked";
  if (permission !== "granted") return "off";
  const reg = await registerServiceWorker();
  if (!reg) return "unsupported";
  return (await subscribe(reg)) ? "on" : "off";
}

/** Turn reminders off on this device (the server stops sending; the browser subscription is dropped too). */
export async function disablePush(): Promise<PushState> {
  const reg = await registerServiceWorker();
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await disablePushSubscriptionAction(sub.endpoint);
    await sub.unsubscribe();
  }
  return "off";
}

/**
 * On every app open: keep the subscription alive on the server (iOS drops them silently) and
 * set the number on the app icon. Never asks for permission.
 */
export async function syncPush(badge: number): Promise<void> {
  if (!supported()) return;
  if ("setAppBadge" in navigator) {
    try {
      if (badge > 0) await navigator.setAppBadge(badge);
      else await navigator.clearAppBadge();
    } catch {
      // badges switched off in iOS Settings
    }
  }
  if (Notification.permission !== "granted") return;
  const reg = await registerServiceWorker();
  if (reg) await subscribe(reg);
}
