'use client';

import { ArrowDown, ArrowUp, ArrowsDownUp } from '@phosphor-icons/react';
import type { Column } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}) {
  if (!column.getCanSort()) {
    return <span className={className}>{title}</span>;
  }
  const sorted = column.getIsSorted();
  const Icon = sorted === 'asc' ? ArrowUp : sorted === 'desc' ? ArrowDown : ArrowsDownUp;
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`-ml-3 h-8 ${className ?? ''}`}
      onClick={() => column.toggleSorting(sorted === 'asc')}
    >
      <span>{title}</span>
      <Icon className="ml-1 size-3.5 opacity-60" />
    </Button>
  );
}
