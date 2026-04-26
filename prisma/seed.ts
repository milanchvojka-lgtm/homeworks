import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const DEFAULT_PIN = "1234";

const USERS = [
  { name: "Milan", role: "ADMIN" as const, avatarColor: "#2563eb" },
  { name: "Teri", role: "ADMIN" as const, avatarColor: "#db2777" },
  {
    name: "Ani",
    role: "CHILD" as const,
    avatarColor: "#f59e0b",
    rotationOrder: 1,
    monthlyAllowanceCzk: 500,
  },
  {
    name: "Emi",
    role: "CHILD" as const,
    avatarColor: "#10b981",
    rotationOrder: 2,
    monthlyAllowanceCzk: 500,
  },
  {
    name: "Neli",
    role: "CHILD" as const,
    avatarColor: "#8b5cf6",
    rotationOrder: 3,
    monthlyAllowanceCzk: 500,
  },
];

async function main() {
  const pinHash = await bcrypt.hash(DEFAULT_PIN, 10);

  for (const u of USERS) {
    const existing = await db.user.findFirst({ where: { name: u.name } });
    if (existing) {
      console.log(`skip ${u.name} (already exists)`);
      continue;
    }
    await db.user.create({ data: { ...u, pinHash } });
    console.log(`created ${u.name} (${u.role})`);
  }

  console.log(`\nDefault PIN for all users: ${DEFAULT_PIN}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
