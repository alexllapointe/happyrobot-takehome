import { SidebarTrigger } from '@/components/ui/sidebar';

export function PageHeader({ title }: { title: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4 md:px-6">
      {/* Hamburger to open the sidebar — only on mobile; on desktop the
          sidebar is always visible so the trigger is hidden. */}
      <SidebarTrigger className="md:hidden" />
      <h1 className="text-2xl font-semibold leading-tight tracking-tight">{title}</h1>
    </header>
  );
}
