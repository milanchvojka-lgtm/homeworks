import "server-only";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";
import type { User } from "@prisma/client";

const SESSION_COOKIE = "homeworks_session";
const SESSION_DAYS = 30;
const BCRYPT_ROUNDS = 10;

const LOCKOUT_MAX_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 5 * 60 * 1000;

type LockoutEntry = { fails: number; firstFailAt: number };
const lockouts = new Map<string, LockoutEntry>();

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, BCRYPT_ROUNDS);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export function isLockedOut(userId: string): boolean {
  const entry = lockouts.get(userId);
  if (!entry) return false;
  if (Date.now() - entry.firstFailAt > LOCKOUT_WINDOW_MS) {
    lockouts.delete(userId);
    return false;
  }
  return entry.fails >= LOCKOUT_MAX_ATTEMPTS;
}

export function recordFailedAttempt(userId: string): void {
  const entry = lockouts.get(userId);
  const now = Date.now();
  if (!entry || now - entry.firstFailAt > LOCKOUT_WINDOW_MS) {
    lockouts.set(userId, { fails: 1, firstFailAt: now });
    return;
  }
  entry.fails += 1;
}

export function clearAttempts(userId: string): void {
  lockouts.delete(userId);
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { userId, token, expiresAt } });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return token;
}

export async function getSession(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session.user;
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { token } }).catch(() => {});
  }
  jar.delete(SESSION_COOKIE);
}

export { SESSION_COOKIE };
