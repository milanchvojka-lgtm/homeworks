import { db } from "@/lib/db";
import { UserRow } from "./_user-row";

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      role: true,
      avatarColor: true,
      rotationOrder: true,
      monthlyAllowanceCzk: true,
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Uživatelé</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Pět profilů. Reset PINu nastaví dočasný „0000" a vymaže aktivní session.
      </p>

      <ul className="mt-6 space-y-2">
        {users.map((u) => (
          <UserRow key={u.id} user={u} />
        ))}
      </ul>
    </div>
  );
}
