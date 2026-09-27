import { vi } from "vitest";
import type { User } from "@prisma/client";

// D22 guard: the simulation wipes its schema, so it must never run against production data.
for (const key of ["DATABASE_URL", "DIRECT_URL"]) {
  if (!process.env[key]?.includes("schema=homeworks_test")) {
    throw new Error(`${key} must point at schema=homeworks_test (see .env.test.local, D22)`);
  }
}

/** The user the next server action runs as (set with `asUser`). */
export const actor: { user: User | null } = ((globalThis as { __simActor?: { user: User | null } }).__simActor ??= { user: null });

vi.mock("next/cache", () => ({ revalidatePath: () => {}, revalidateTag: () => {} }));

vi.mock("@/lib/auth", async (importOriginal) => {
  const orig = await importOriginal<typeof import("@/lib/auth")>();
  return { ...orig, getSession: async () => actor.user };
});

// Prisma fills createdAt/updatedAt in the query engine with the real clock. The simulation runs on
// a fake clock, so the client sets them from `new Date()` (= simulated time) instead.
vi.mock("@/lib/db", async () => {
  const { PrismaClient, Prisma } = await import("@prisma/client");
  const fields = new Map(
    Prisma.dmmf.datamodel.models.map((m) => [
      m.name.toLowerCase(),
      new Set(m.fields.map((f) => f.name)),
    ]),
  );
  const stamp = (model: string, data: Record<string, unknown>, create: boolean) => {
    const f = fields.get(model.toLowerCase());
    if (!f || !data || typeof data !== "object") return data;
    const out = { ...data };
    if (create && f.has("createdAt") && out.createdAt === undefined) out.createdAt = new Date();
    if (f.has("updatedAt") && out.updatedAt === undefined) out.updatedAt = new Date();
    return out;
  };
  const base = new PrismaClient();
  const db = base.$extends({
    query: {
      $allModels: {
        async create({ model, args, query }) {
          args.data = stamp(model, args.data as Record<string, unknown>, true) as typeof args.data;
          return query(args);
        },
        async createMany({ model, args, query }) {
          const d = args.data as Record<string, unknown> | Record<string, unknown>[];
          args.data = (Array.isArray(d) ? d.map((x) => stamp(model, x, true)) : stamp(model, d, true)) as typeof args.data;
          return query(args);
        },
        async update({ model, args, query }) {
          args.data = stamp(model, args.data as Record<string, unknown>, false) as typeof args.data;
          return query(args);
        },
        async updateMany({ model, args, query }) {
          args.data = stamp(model, args.data as Record<string, unknown>, false) as typeof args.data;
          return query(args);
        },
        async upsert({ model, args, query }) {
          args.create = stamp(model, args.create as Record<string, unknown>, true) as typeof args.create;
          args.update = stamp(model, args.update as Record<string, unknown>, false) as typeof args.update;
          return query(args);
        },
      },
    },
  });
  return { db };
});
