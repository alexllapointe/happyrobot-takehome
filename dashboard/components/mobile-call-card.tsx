import { OUTCOME_LABELS } from '@/lib/constants';
import { fmtDate, fmtUSD, truncateWords } from '@/lib/format';
import type { CallRow } from '@/lib/types';

export function MobileCallCard({ call }: { call: CallRow }) {
  const summary = call.ai_summary ?? call.transcript_summary;
  const lane = call.loads ? `${call.loads.origin} → ${call.loads.destination}` : null;
  return (
    <div className="space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-base font-semibold leading-tight">
            {call.carrier_name ?? 'Unknown carrier'}
          </div>
          <div className="text-xs text-muted-foreground">
            {call.mc_number ? `MC ${call.mc_number} · ` : ''}
            {fmtDate(call.created_at)}
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
          {OUTCOME_LABELS[call.outcome]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
        <Field label="Lane" value={lane ?? '—'} />
        <Field label="Load" value={call.load_id ?? '—'} />
        <Field label="Final" value={fmtUSD(call.final_rate)} bold />
        <Field label="Offers" value={call.num_offers ?? '—'} />
      </div>

      {summary ? (
        <p className="text-xs leading-snug text-muted-foreground">
          {truncateWords(summary, 14)}
        </p>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  bold,
}: {
  label: string;
  value: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={'truncate text-sm ' + (bold ? 'font-medium' : '')}>{value}</span>
    </div>
  );
}
