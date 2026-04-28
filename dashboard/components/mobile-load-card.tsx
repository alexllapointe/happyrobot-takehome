import { fmtDate, fmtUSD } from '@/lib/format';
import type { LoadRow } from '@/lib/types';

export function MobileLoadCard({ load }: { load: LoadRow }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-base font-semibold leading-tight">
            {load.load_id}
          </div>
          <div className="text-xs text-muted-foreground">{load.equipment_type}</div>
        </div>
        <span className="shrink-0 text-base font-semibold">{fmtUSD(load.loadboard_rate)}</span>
      </div>

      <div className="text-sm leading-snug">
        {load.origin} <span className="text-muted-foreground">→</span> {load.destination}
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
        <Field label="Pickup" value={fmtDate(load.pickup_datetime)} />
        <Field label="Miles" value={load.miles ?? '—'} />
        <Field label="Commodity" value={load.commodity_type ?? '—'} />
        <Field label="Weight" value={load.weight ? `${load.weight.toLocaleString()} lb` : '—'} />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="truncate text-sm">{value}</span>
    </div>
  );
}
