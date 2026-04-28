'use client';

import { useState } from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type FilterFn,
} from '@tanstack/react-table';
import { CaretDown, Funnel, Trash, X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { DataTableFilterDialog } from '@/components/data-table-filter-dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Placeholder for the global search input. */
  searchPlaceholder?: string;
  emptyMessage?: string;
  primaryAction?: { label: string; onClick: () => void };
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  loading?: boolean;
  /** When provided, a floating action bar shows up on row selection
   * with a Delete button that calls this with the selected rows. */
  onDelete?: (rows: TData[]) => Promise<void>;
};

// Global "fuzzy" filter that searches across every accessor column's text
// representation. Lets the search input hit MC, carrier name, lane, load id,
// summary, etc. all at once.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalFilter: FilterFn<any> = (row, _columnId, value) => {
  const needle = String(value).trim().toLowerCase();
  if (!needle) return true;
  const haystack = row
    .getAllCells()
    .map((c) => {
      const v = c.getValue();
      if (v == null) return '';
      if (Array.isArray(v)) return v.join(' ');
      return String(v);
    })
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
};

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results.',
  primaryAction,
  pageSize = 25,
  onRowClick,
  loading = false,
  onDelete,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilterValue,
    globalFilterFn: globalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: { pagination: { pageSize } },
    state: {
      sorting,
      columnFilters,
      globalFilter: globalFilterValue,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex shrink-0 items-center gap-2 py-4">
        <Input
          placeholder={searchPlaceholder}
          value={globalFilterValue}
          onChange={(e) => setGlobalFilterValue(e.target.value)}
          className="max-w-sm"
        />

        <div className="ml-auto flex items-center gap-2">
          {primaryAction ? (
            <Button onClick={primaryAction.onClick}>{primaryAction.label}</Button>
          ) : null}
          <Button variant="outline" onClick={() => setFilterDialogOpen(true)}>
            <Funnel className="mr-1 size-4" /> Filter
            {(columnFilters.length > 0 || sorting.length > 0) && (
              <span className="ml-1 rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
                {columnFilters.length + sorting.length}
              </span>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns <CaretDown className="ml-1 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((c) => c.getCanHide())
                .map((c) => (
                  <DropdownMenuCheckboxItem
                    key={c.id}
                    className="capitalize"
                    checked={c.getIsVisible()}
                    onCheckedChange={(v) => c.toggleVisibility(!!v)}
                  >
                    {c.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="scrollbar-clean flex-1 overflow-auto rounded-lg bg-card">
        <table className="w-full caption-bottom text-sm [&_tbody_tr]:border-0 [&_th]:px-4 [&_td]:px-4">
          <TableHeader className="sticky top-0 z-10 bg-muted/40 [&_tr]:border-0">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-muted/40">
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className="h-11 text-foreground">
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="hover:bg-transparent">
                  {columns.map((col, j) => (
                    <TableCell key={j} className="py-3.5">
                      <Skeleton className="h-4 w-full max-w-[160px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={
                    'hover:bg-muted/30 ' +
                    (onRowClick ? 'cursor-pointer' : '')
                  }
                >
                  {row.getVisibleCells().map((cell) => {
                    const isInteractive =
                      cell.column.id === 'select' || cell.column.id === 'actions';
                    return (
                      <TableCell
                        key={cell.id}
                        className="py-3.5"
                        onClick={
                          isInteractive ? (e) => e.stopPropagation() : undefined
                        }
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </table>
      </div>

      <DataTableFilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        table={table}
      />

      {/* Floating selection bar — appears when at least one row is selected
          and an `onDelete` handler is wired. White surface with a red
          delete button, centered at the bottom of the viewport with a
          high z-index so it sits over any content. */}
      {onDelete && table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-background px-4 py-2 text-foreground shadow-xl shadow-black/15 ring-1 ring-black/5">
          <span className="px-2 text-sm font-medium">
            {table.getFilteredSelectedRowModel().rows.length} selected
          </span>
          <Button
            size="sm"
            className="rounded-full bg-red-600 text-white hover:bg-red-700"
            disabled={deleting}
            onClick={async () => {
              const rows = table
                .getFilteredSelectedRowModel()
                .rows.map((r) => r.original);
              setDeleting(true);
              try {
                await onDelete(rows);
                table.resetRowSelection();
              } finally {
                setDeleting(false);
              }
            }}
          >
            <Trash className="mr-1 size-4" weight="bold" />
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-8 rounded-full"
            onClick={() => table.resetRowSelection()}
          >
            <X className="size-4" weight="bold" />
            <span className="sr-only">Clear selection</span>
          </Button>
        </div>
      ) : null}

      <div className="flex shrink-0 items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
