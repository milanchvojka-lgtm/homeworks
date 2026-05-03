export default function SlidesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark fixed inset-0 overflow-hidden bg-background text-foreground">
      {children}
    </div>
  );
}
