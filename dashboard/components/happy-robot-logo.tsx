import Image from 'next/image';
import { cn } from '@/lib/utils';

export function HappyRobotLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative inline-flex h-8 w-8 shrink-0 overflow-hidden rounded-md',
        className,
      )}
      aria-label="Happy Robot"
    >
      <Image
        src="/assets/happyrobot_logo.jpeg"
        alt=""
        fill
        sizes="32px"
        className="object-cover"
        priority
      />
    </span>
  );
}
