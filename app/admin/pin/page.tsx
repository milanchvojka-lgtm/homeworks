import { AdminSubpage } from "../_components/subpage";
import { ChangePinForm } from "@/app/_components/change-pin-form";

/** Parent's own PIN, reachable from Víc (same form as the child's Já → Změnit PIN). */
export default function AdminPinPage() {
  return (
    <AdminSubpage title="Změnit PIN" back="/admin/vic">
      <section className="rounded-tile border border-border bg-card p-[18px]">
        <ChangePinForm />
      </section>
    </AdminSubpage>
  );
}
