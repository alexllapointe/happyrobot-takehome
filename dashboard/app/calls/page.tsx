'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { CallDetailSheet } from '@/components/call-detail-sheet';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { callsColumns } from '@/components/tables/calls-columns';
import { api } from '@/lib/api';
import { useDashboardStore } from '@/lib/dashboard-store';
import type { CallRow } from '@/lib/types';

export default function CallsPage() {
  const { calls, loading, setCalls } = useDashboardStore();
  const [selected, setSelected] = useState<CallRow | null>(null);

  return (
    <>
      <PageHeader title="Calls" />
      <main className="flex flex-1 flex-col overflow-hidden px-6 pb-6">
        <DataTable
          columns={callsColumns}
          data={calls}
          loading={loading && calls.length === 0}
          searchPlaceholder="Search Calls"
          emptyMessage="No calls yet."
          onRowClick={setSelected}
          onDelete={async (rows) => {
            const ids = rows.map((r) => r.id);
            try {
              await Promise.all(ids.map((id) => api.deleteCall(id)));
              setCalls((prev) => prev.filter((c) => !ids.includes(c.id)));
              toast.success(
                `Deleted ${rows.length} call${rows.length === 1 ? '' : 's'}`,
              );
            } catch (e) {
              toast.error('Failed to delete', {
                description: (e as Error).message,
              });
            }
          }}
        />
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
