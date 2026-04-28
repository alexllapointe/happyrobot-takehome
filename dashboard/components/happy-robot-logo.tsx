import { cn } from '@/lib/utils';

// Acme Logistics letter mark. Black rounded square with a white "A" — kept
// monochrome so it sits inside the sidebar header without competing with
// the rest of the UI. (File name kept as `happy-robot-logo.tsx` to avoid
// churn across imports; component is brand-neutral now.)
export function HappyRobotLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-foreground text-background font-bold text-sm tracking-tight',
        className,
      )}
      aria-label="Acme Logistics"
    >
      A
    </span>
  );
}
