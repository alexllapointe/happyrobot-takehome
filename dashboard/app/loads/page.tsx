'use client';

import { useState } from 'react';
import { DataTable } from '@/components/data-table';
import { LoadDetailSheet } from '@/components/load-detail-sheet';
import { PageHeader } from '@/components/page-header';
import { loadsColumns } from '@/components/tables/loads-columns';
import { useDashboardStore } from '@/lib/dashboard-store';
import type { LoadRow } from '@/lib/types';

export default function LoadsPage() {
  const { loads, loading, setLoads } = useDashboardStore();
  const [selected, setSelected] = useState<LoadRow | null>(null);

  return (
    <>
      <PageHeader title="Loads" />
      <main className="flex flex-1 flex-col overflow-hidden px-6 pb-6">
        <DataTable
          columns={loadsColumns}
          data={loads}
          loading={loading && loads.length === 0}
          searchPlaceholder="Search Loads"
          emptyMessage="No loads in the database."
          onRowClick={setSelected}
        />
      </main>
      <LoadDetailSheet
        load={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        onUpdated={(updated) => {
          setLoads((prev) =>
            prev.map((l) => (l.load_id === updated.load_id ? updated : l)),
          );
          setSelected(updated);
        }}
      />
    </>
  );
}
