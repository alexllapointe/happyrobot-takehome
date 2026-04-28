'use client';

import { useState } from 'react';
import { DataTable } from '@/components/data-table';
import { LoadDetailSheet } from '@/components/load-detail-sheet';
import { MobileDataList } from '@/components/mobile-data-list';
import { MobileLoadCard } from '@/components/mobile-load-card';
import { PageHeader } from '@/components/page-header';
import { loadsColumns } from '@/components/tables/loads-columns';
import { useDashboardStore } from '@/lib/dashboard-store';
import type { LoadRow } from '@/lib/types';

const loadSearchText = (l: LoadRow) =>
  [
    l.load_id,
    l.origin,
    l.destination,
    l.equipment_type,
    l.commodity_type,
    l.notes,
  ]
    .filter(Boolean)
    .join(' ');

export default function LoadsPage() {
  const { loads, loading, setLoads } = useDashboardStore();
  const [selected, setSelected] = useState<LoadRow | null>(null);

  return (
    <>
      <PageHeader title="Loads" />
      <main className="flex flex-1 flex-col overflow-hidden px-4 pb-6 md:px-6">
        <div className="hidden flex-1 md:flex md:flex-col md:overflow-hidden">
          <DataTable
            columns={loadsColumns}
            data={loads}
            loading={loading && loads.length === 0}
            searchPlaceholder="Search Loads"
            emptyMessage="No loads in the database."
            onRowClick={setSelected}
          />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden md:hidden">
          <MobileDataList
            data={loads}
            loading={loading && loads.length === 0}
            searchPlaceholder="Search Loads"
            emptyMessage="No loads in the database."
            searchableText={loadSearchText}
            onItemClick={setSelected}
            renderCard={(load) => <MobileLoadCard load={load} />}
          />
        </div>
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
