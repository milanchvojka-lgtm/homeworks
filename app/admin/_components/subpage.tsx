import { BackHeader } from "@/app/_components/app-header";

/** Frame of a parent subpage under Víc or Děti: back header + content with the tab padding. */
export function AdminSubpage({
  title,
  back,
  children,
}: {
  title: string;
  back: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <BackHeader title={title} fallbackHref={back} />
      <main className="flex flex-1 flex-col gap-3 px-4 pt-5 pb-4">{children}</main>
    </>
  );
}
