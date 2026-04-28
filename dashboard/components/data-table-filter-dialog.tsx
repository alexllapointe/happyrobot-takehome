'use client';

import { useEffect, useState } from 'react';
import { Plus, X as CloseIcon } from '@phosphor-icons/react';
import type { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type FilterRow = { id: string; value: string };
type SortRow = { id: string; desc: boolean };

export function DataTableFilterDialog<TData>({
  open,
  onOpenChange,
  table,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
}) {
  const filterableColumns = table
    .getAllColumns()
    .filter((c) => c.id !== 'select' && c.id !== 'actions');
  const columnOptions = filterableColumns.map((c) => ({
    value: c.id,
    label: c.id.replace(/_/g, ' '),
  }));

  const [filters, setFilters] = useState<FilterRow[]>([]);
  const [sorts, setSorts] = useState<SortRow[]>([]);

  // Hydrate from current table state every time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setFilters(
      table.getState().columnFilters.map((f) => ({
        id: f.id,
        value: String(f.value ?? ''),
      })),
    );
    setSorts(table.getState().sorting.map((s) => ({ id: s.id, desc: s.desc })));
  }, [open, table]);

  function apply() {
    const validFilters = filters.filter((f) => f.id && f.value !== '');
    table.setColumnFilters(
      validFilters.map((f) => ({ id: f.id, value: f.value })),
    );
    table.setSorting(
      sorts.filter((s) => s.id).map((s) => ({ id: s.id, desc: s.desc })),
    );
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Filter & Sort</DialogTitle>
          <DialogDescription>
            Stack filters and multi-column sorts. Apply when ready.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Filters
            </h3>
            <div className="space-y-2">
              {filters.length === 0 ? (
                <p className="text-sm text-muted-foreground">No filters applied.</p>
              ) : null}
              {filters.map((f, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Select
                    value={f.id}
                    onValueChange={(v) =>
                      setFilters((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, id: v } : p)),
                      )
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Column" />
                    </SelectTrigger>
                    <SelectContent>
                      {columnOptions.map((c) => (
                        <SelectItem key={c.value} value={c.value} className="capitalize">
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Value"
                    value={f.value}
                    onChange={(e) =>
                      setFilters((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, value: e.target.value } : p)),
                      )
                    }
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setFilters((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    <CloseIcon className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters((prev) => [
                  ...prev,
                  { id: columnOptions[0]?.value ?? '', value: '' },
                ])
              }
            >
              <Plus className="mr-1 size-3" /> Add filter
            </Button>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sort by
            </h3>
            <div className="space-y-2">
              {sorts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sort applied.</p>
              ) : null}
              {sorts.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 text-xs text-muted-foreground">{idx + 1}.</span>
                  <Select
                    value={s.id}
                    onValueChange={(v) =>
                      setSorts((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, id: v } : p)),
                      )
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Column" />
                    </SelectTrigger>
                    <SelectContent>
                      {columnOptions.map((c) => (
                        <SelectItem key={c.value} value={c.value} className="capitalize">
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={s.desc ? 'desc' : 'asc'}
                    onValueChange={(v) =>
                      setSorts((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, desc: v === 'desc' } : p)),
                      )
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSorts((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    <CloseIcon className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSorts((prev) => [
                  ...prev,
                  { id: columnOptions[0]?.value ?? '', desc: false },
                ])
              }
            >
              <Plus className="mr-1 size-3" /> Add sort
            </Button>
          </section>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              setFilters([]);
              setSorts([]);
            }}
          >
            Clear all
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={apply}>Apply</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
