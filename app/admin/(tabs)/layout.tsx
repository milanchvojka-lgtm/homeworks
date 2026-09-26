import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppHeader } from "@/app/_components/app-header";

/** Parent tabs carry the greeting header; subpages (detail dítěte, formuláře) have a back header instead. */
export default async function AdminTabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/");

  return (
    <>
      <AppHeader name={user.name} />
      <main className="flex flex-1 flex-col gap-3 px-4 pt-5 pb-4">{children}</main>
    </>
  );
}
