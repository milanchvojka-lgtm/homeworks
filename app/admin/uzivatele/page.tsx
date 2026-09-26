import { db } from "@/lib/db";
import { UserRow } from "./_user-row";
import { AdminSubpage } from "../_components/subpage";

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
    <AdminSubpage title="Uživatelé" back="/admin/vic">
      <p className="text-sm text-muted-foreground">
        Pět profilů. Reset PINu nastaví dočasný „0000" a vymaže aktivní session.
      </p>

      <ul className="flex flex-col gap-2.5">
        {users.map((u) => (
          <UserRow key={u.id} user={u} />
        ))}
      </ul>
    </AdminSubpage>
  );
}
