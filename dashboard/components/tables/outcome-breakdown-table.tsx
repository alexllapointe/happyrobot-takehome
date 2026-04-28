'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OUTCOME_COLORS } from '@/lib/constants';
import { fmtPct } from '@/lib/format';
import { outcomeBreakdown } from '@/lib/analytics';
import type { CallRow } from '@/lib/types';

export function OutcomeBreakdownTable({ calls }: { calls: CallRow[] }) {
  const rows = outcomeBreakdown(calls);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Outcome</TableHead>
          <TableHead className="text-right">Count</TableHead>
          <TableHead className="text-right">% of total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.outcome}>
            <TableCell className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: OUTCOME_COLORS[r.outcome] }}
              />
              {r.label}
            </TableCell>
            <TableCell className="text-right font-medium">{r.count}</TableCell>
            <TableCell className="text-right">{fmtPct(r.share)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
