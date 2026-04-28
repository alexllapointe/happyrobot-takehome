'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { laneBreakdown } from '@/lib/analytics';
import { fmtPct, fmtUSD } from '@/lib/format';
import type { CallRow } from '@/lib/types';

export function LaneBreakdownTable({ calls }: { calls: CallRow[] }) {
  const rows = laneBreakdown(calls);
  if (rows.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No lane data — calls need to be linked to a load.
      </div>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Lane</TableHead>
          <TableHead className="text-right">Calls</TableHead>
          <TableHead className="text-right">Booked</TableHead>
          <TableHead className="text-right">Booking rate</TableHead>
          <TableHead className="text-right">Avg final rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.lane}>
            <TableCell className="whitespace-nowrap">{r.lane}</TableCell>
            <TableCell className="text-right">{r.calls}</TableCell>
            <TableCell className="text-right">{r.booked}</TableCell>
            <TableCell className="text-right">{fmtPct(r.bookingRate)}</TableCell>
            <TableCell className="text-right font-medium">{fmtUSD(r.avgFinal)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
