'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { CallDetailSheet } from '@/components/call-detail-sheet';
import { DataTable } from '@/components/data-table';
import { MobileCallCard } from '@/components/mobile-call-card';
import { MobileDataList } from '@/components/mobile-data-list';
import { PageHeader } from '@/components/page-header';
import { callsColumns } from '@/components/tables/calls-columns';
import { OUTCOME_LABELS } from '@/lib/constants';
import { api } from '@/lib/api';
import { useDashboardStore } from '@/lib/dashboard-store';
import type { CallRow } from '@/lib/types';

const callSearchText = (c: CallRow) =>
  [
    c.carrier_name,
    c.mc_number,
    c.load_id,
    c.loads?.origin,
    c.loads?.destination,
    OUTCOME_LABELS[c.outcome],
    c.ai_classification,
    c.ai_summary,
    c.transcript_summary,
  ]
    .filter(Boolean)
    .join(' ');

export default function CallsPage() {
  const { calls, loading, setCalls } = useDashboardStore();
  const [selected, setSelected] = useState<CallRow | null>(null);

  const handleDelete = async (rows: CallRow[]) => {
    const ids = rows.map((r) => r.id);
    try {
      await Promise.all(ids.map((id) => api.deleteCall(id)));
      setCalls((prev) => prev.filter((c) => !ids.includes(c.id)));
      toast.success(`Deleted ${rows.length} call${rows.length === 1 ? '' : 's'}`);
    } catch (e) {
      toast.error('Failed to delete', { description: (e as Error).message });
    }
  };

  return (
    <>
      <PageHeader title="Calls" />
      <main className="flex flex-1 flex-col overflow-hidden px-4 pb-6 md:px-6">
        {/* Desktop: rich data table */}
        <div className="hidden flex-1 md:flex md:flex-col md:overflow-hidden">
          <DataTable
            columns={callsColumns}
            data={calls}
            loading={loading && calls.length === 0}
            searchPlaceholder="Search Calls"
            emptyMessage="No calls yet."
            onRowClick={setSelected}
            onDelete={handleDelete}
          />
        </div>

        {/* Mobile: stacked cards */}
        <div className="flex flex-1 flex-col overflow-hidden md:hidden">
          <MobileDataList
            data={calls}
            loading={loading && calls.length === 0}
            searchPlaceholder="Search Calls"
            emptyMessage="No calls yet."
            searchableText={callSearchText}
            onItemClick={setSelected}
            renderCard={(call) => <MobileCallCard call={call} />}
          />
        </div>
      </main>

      <CallDetailSheet
        call={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </>
  );
}
