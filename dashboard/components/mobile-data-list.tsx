'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

// Mobile-only stacked list. Each item renders as a tap-able card via the
// caller's `renderCard` prop. Search is a simple substring match against
// whatever string the caller produces with `searchableText`.

export type MobileDataListProps<T> = {
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
  searchableText: (item: T) => string;
  renderCard: (item: T) => React.ReactNode;
  onItemClick?: (item: T) => void;
};

export function MobileDataList<T>({
  data,
  loading = false,
  emptyMessage = 'Nothing here yet.',
  searchPlaceholder = 'Search…',
  searchableText,
  renderCard,
  onItemClick,
}: MobileDataListProps<T>) {
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? data.filter((item) => searchableText(item).toLowerCase().includes(needle))
    : data;

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 py-3">
        <Input
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="scrollbar-clean flex-1 overflow-y-auto pb-6">
        {loading && data.length === 0 ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onItemClick?.(item)}
                className="rounded-lg bg-card p-4 text-left shadow-sm ring-1 ring-black/5 transition-colors hover:bg-muted/40 active:bg-muted/60"
              >
                {renderCard(item)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
