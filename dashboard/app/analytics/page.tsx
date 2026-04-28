'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/kpi-card';
import { PageHeader } from '@/components/page-header';
import { EquipmentBreakdownTable } from '@/components/tables/equipment-breakdown-table';
import { LaneBreakdownTable } from '@/components/tables/lane-breakdown-table';
import { OutcomeBreakdownTable } from '@/components/tables/outcome-breakdown-table';
import { computeKpis } from '@/lib/analytics';
import { fmtUSD } from '@/lib/format';
import { useDashboardStore } from '@/lib/dashboard-store';

export default function AnalyticsPage() {
  const { calls, loading } = useDashboardStore();
  const kpis = computeKpis(calls);

  return (
    <>
      <PageHeader title="Analytics" />

      <main className="scrollbar-clean flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-6 md:px-6">
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiCard
            title="Booking rate"
            value={loading ? '—' : `${kpis.bookingRate.toFixed(0)}%`}
          />
          <KpiCard
            title="Avg final rate"
            value={loading ? '—' : fmtUSD(kpis.avgFinal)}
            hint="Booked calls only"
          />
          <KpiCard
            title="Avg uplift / book"
            value={loading ? '—' : kpis.avgUplift != null ? fmtUSD(kpis.avgUplift) : '—'}
            hint="Final − initial offer"
          />
          <KpiCard
            title="Avg offers / call"
            value={loading ? '—' : kpis.avgOffers != null ? kpis.avgOffers.toFixed(1) : '—'}
          />
        </section>

        <Card>
          <CardHeader>
            <CardTitle>By outcome</CardTitle>
            <CardDescription>Distribution of how calls ended.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <OutcomeBreakdownTable calls={calls} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By equipment type</CardTitle>
            <CardDescription>
              Where the agent converts best. Pulled from the load attached to each call.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <EquipmentBreakdownTable calls={calls} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top lanes</CardTitle>
            <CardDescription>By call volume — top 10.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <LaneBreakdownTable calls={calls} />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
