import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { LoginScreen } from "./_components/login-screen";

export default async function Home() {
  const user = await getSession();
  if (user) {
    redirect(user.role === "ADMIN" ? "/admin" : "/child");
  }

  const users = await db.user.findMany({
    select: { id: true, name: true, role: true, avatarColor: true },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return <LoginScreen users={users} />;
}
