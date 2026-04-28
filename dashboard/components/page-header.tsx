export function PageHeader({ title }: { title: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center px-6">
      <h1 className="text-2xl font-semibold leading-tight tracking-tight">{title}</h1>
    </header>
  );
}
