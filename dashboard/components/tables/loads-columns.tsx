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
import { fmtDate, fmtUSD } from '@/lib/format';
import type { LoadRow } from '@/lib/types';

export const loadsColumns: ColumnDef<LoadRow>[] = [
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
    accessorKey: 'load_id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Load" />,
    cell: ({ row }) => <span className="font-medium">{row.original.load_id}</span>,
  },
  {
    accessorKey: 'origin',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Origin" />,
  },
  {
    accessorKey: 'destination',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Destination" />,
  },
  {
    accessorKey: 'equipment_type',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Equipment" />,
  },
  {
    accessorKey: 'pickup_datetime',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Pickup" />,
    cell: ({ row }) => fmtDate(row.original.pickup_datetime),
  },
  {
    accessorKey: 'miles',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Miles" className="ml-auto" />
    ),
    cell: ({ row }) => <div className="text-right">{row.original.miles ?? '—'}</div>,
  },
  {
    accessorKey: 'loadboard_rate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rate" className="ml-auto" />
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">{fmtUSD(row.original.loadboard_rate)}</div>
    ),
  },
  {
    accessorKey: 'commodity_type',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Commodity" />,
    cell: ({ row }) => row.original.commodity_type ?? '—',
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
              navigator.clipboard.writeText(row.original.load_id);
              toast.success('Load ID copied');
            }}
          >
            Copy load ID
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
