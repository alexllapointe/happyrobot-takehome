'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { TranscriptView } from '@/components/transcript-view';
import { OUTCOME_LABELS } from '@/lib/constants';
import { fmtDate, fmtUSD } from '@/lib/format';
import type { CallRow } from '@/lib/types';

export function CallDetailSheet({
  call,
  open,
  onOpenChange,
}: {
  call: CallRow | null;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full p-0 sm:max-w-xl"
      >
        {call ? <CallDetailBody call={call} /> : null}
      </SheetContent>
    </Sheet>
  );
}

function CallDetailBody({ call }: { call: CallRow }) {
  const lane = call.loads ? `${call.loads.origin} → ${call.loads.destination}` : null;

  return (
    <div className="flex h-full flex-col">
      <SheetHeader className="px-6 pt-6 pb-4">
        <SheetTitle className="text-xl">{call.carrier_name ?? 'Unknown carrier'}</SheetTitle>
        <SheetDescription>
          {call.mc_number ? `MC ${call.mc_number} · ` : ''}
          {fmtDate(call.created_at)}
          {call.duration_seconds ? ` · ${formatDuration(call.duration_seconds)}` : ''}
        </SheetDescription>
      </SheetHeader>

      <div className="scrollbar-clean flex-1 overflow-y-auto">
        <div className="space-y-6 px-6 pb-8">
          <Section title="Outcome">
            <Field label="Result">{OUTCOME_LABELS[call.outcome]}</Field>
            <Field label="Sentiment">
              <span className="capitalize">{call.sentiment ?? '—'}</span>
            </Field>
            <Field label="Lane">{lane ?? '—'}</Field>
            <Field label="Load">{call.load_id ?? '—'}</Field>
            {call.decline_reason ? (
              <Field label="Decline reason">{call.decline_reason}</Field>
            ) : null}
          </Section>

          <Section title="Call">
            {call.caller_number ? (
              <Field label="Caller">{call.caller_number}</Field>
            ) : null}
            {call.duration_seconds ? (
              <Field label="Duration">{formatDuration(call.duration_seconds)}</Field>
            ) : null}
            {!call.caller_number && !call.duration_seconds ? (
              <p className="text-sm text-muted-foreground">No call metadata.</p>
            ) : null}
          </Section>

          <Section title="Negotiation">
            <Field label="Initial offer">{fmtUSD(call.initial_rate)}</Field>
            <Field label="Final rate">
              <span className="font-medium">{fmtUSD(call.final_rate)}</span>
            </Field>
            <Field label="Offers exchanged">{call.num_offers ?? '—'}</Field>
          </Section>

          {call.ai_classification || call.ai_topics?.length || call.ai_follow_up != null ? (
            <Section title="Classification">
              {call.ai_classification ? (
                <Field label="Category">{call.ai_classification}</Field>
              ) : null}
              {call.ai_follow_up != null ? (
                <Field label="Needs follow-up">{call.ai_follow_up ? 'Yes' : 'No'}</Field>
              ) : null}
              {call.ai_topics?.length ? (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground">Topics</span>
                  <div className="flex flex-wrap gap-1.5">
                    {call.ai_topics.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </Section>
          ) : null}

          {call.ai_summary ? (
            <Section title="Summary">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{call.ai_summary}</p>
            </Section>
          ) : null}

          {call.transcript_summary ? (
            <Section title="Transcript">
              <div className="scrollbar-clean max-h-[480px] overflow-y-auto pr-2">
                <TranscriptView raw={call.transcript_summary} />
              </div>
            </Section>
          ) : null}

          <Section title="Reference">
            <Field label="Call ID" mono>
              {call.call_id ?? call.id}
            </Field>
            {call.session_id ? (
              <Field label="Session ID" mono>
                {call.session_id}
              </Field>
            ) : null}
            {call.ai_extracted_at ? (
              <Field label="Extracted">{fmtDate(call.ai_extracted_at)}</Field>
            ) : null}
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

function Field({
  label,
  children,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-baseline gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={'text-sm ' + (mono ? 'font-mono' : '')}>{children}</span>
    </div>
  );
}
