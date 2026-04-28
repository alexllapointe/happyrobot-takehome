'use client';

import { DotsThree } from '@phosphor-icons/react';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { OUTCOME_LABELS } from '@/lib/constants';
import { fmtDate, fmtUSD, truncateWords } from '@/lib/format';
import type { CallRow } from '@/lib/types';

export const callsColumns: ColumnDef<CallRow>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="When" />,
    cell: ({ row }) => fmtDate(row.original.created_at),
  },
  {
    accessorKey: 'mc_number',
    header: ({ column }) => <DataTableColumnHeader column={column} title="MC" />,
    cell: ({ row }) => row.original.mc_number ?? '—',
  },
  {
    accessorKey: 'carrier_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Carrier" />,
    cell: ({ row }) => row.original.carrier_name ?? '—',
    filterFn: (row, _id, value) =>
      (row.original.carrier_name ?? '').toLowerCase().includes(String(value).toLowerCase()),
  },
  {
    accessorKey: 'load_id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Load" />,
    cell: ({ row }) => row.original.load_id ?? '—',
  },
  {
    id: 'lane',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Lane" />,
    accessorFn: (r) => (r.loads ? `${r.loads.origin} → ${r.loads.destination}` : ''),
    cell: ({ row }) =>
      row.original.loads
        ? `${row.original.loads.origin} → ${row.original.loads.destination}`
        : '—',
  },
  {
    accessorKey: 'outcome',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Outcome" />,
    cell: ({ row }) => OUTCOME_LABELS[row.original.outcome],
  },
  {
    accessorKey: 'ai_classification',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Classification" />,
    cell: ({ row }) =>
      row.original.ai_classification ? (
        <span>{row.original.ai_classification}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: 'final_rate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Final" className="ml-auto" />
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">{fmtUSD(row.original.final_rate)}</div>
    ),
  },
  {
    accessorKey: 'ai_summary',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Summary" />,
    cell: ({ row }) => {
      const summary = row.original.ai_summary ?? row.original.transcript_summary;
      return summary ? (
        <span className="text-muted-foreground">{truncateWords(summary, 4)}</span>
      ) : (
        <span className="text-muted-foreground">Pending…</span>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <DotsThree className="size-4" weight="bold" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(row.original.call_id ?? row.original.id);
              toast.success('Call ID copied');
            }}
          >
            Copy call ID
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
