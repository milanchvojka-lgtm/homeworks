import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

/** Red sign-out row inside a tile (child Já, parent Víc). Pass `className` for a top divider. */
export function LogoutRow({ className }: { className?: string }) {
  return (
    <form action={logoutAction} className={className}>
      <button
        type="submit"
        className="flex h-14 w-full items-center gap-3.5 px-[18px] text-[17px] font-semibold text-destructive"
      >
        <LogOut className="size-5" />
        Odhlásit
      </button>
    </form>
  );
}
