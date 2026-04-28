'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { fmtDate, fmtUSD } from '@/lib/format';
import type { LoadRow } from '@/lib/types';

export function LoadDetailSheet({
  load,
  open,
  onOpenChange,
  onUpdated,
}: {
  load: LoadRow | null;
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onUpdated?: (load: LoadRow) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-xl">
        {load ? <LoadDetailBody load={load} onUpdated={onUpdated} /> : null}
      </SheetContent>
    </Sheet>
  );
}

function LoadDetailBody({
  load,
  onUpdated,
}: {
  load: LoadRow;
  onUpdated?: (load: LoadRow) => void;
}) {
  const [notes, setNotes] = useState(load.notes ?? '');
  const [saving, setSaving] = useState(false);

  // Reset the textarea when a new load is opened.
  useEffect(() => {
    setNotes(load.notes ?? '');
  }, [load.load_id, load.notes]);

  const dirty = (notes ?? '') !== (load.notes ?? '');

  async function save() {
    setSaving(true);
    try {
      const updated = await api.updateLoadNotes(load.load_id, notes.trim() || null);
      toast.success('Notes saved');
      onUpdated?.(updated);
    } catch (e) {
      toast.error('Failed to save notes', { description: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <SheetHeader className="px-6 pt-6 pb-4">
        <SheetTitle className="text-xl">{load.load_id}</SheetTitle>
        <SheetDescription>
          {load.origin} → {load.destination}
        </SheetDescription>
      </SheetHeader>

      <div className="scrollbar-clean flex-1 overflow-y-auto">
        <div className="space-y-6 px-6 pb-8">
          <Section title="Lane">
            <Field label="Origin">{load.origin}</Field>
            <Field label="Destination">{load.destination}</Field>
            <Field label="Miles">{load.miles ?? '—'}</Field>
          </Section>

          <Section title="Schedule">
            <Field label="Pickup">{fmtDate(load.pickup_datetime)}</Field>
            <Field label="Delivery">{fmtDate(load.delivery_datetime)}</Field>
          </Section>

          <Section title="Equipment & freight">
            <Field label="Equipment">{load.equipment_type}</Field>
            <Field label="Commodity">{load.commodity_type ?? '—'}</Field>
            <Field label="Weight">{load.weight ? `${load.weight.toLocaleString()} lbs` : '—'}</Field>
            <Field label="Pieces">{load.num_of_pieces ?? '—'}</Field>
            <Field label="Dimensions">{load.dimensions ?? '—'}</Field>
          </Section>

          <Section title="Rate">
            <Field label="Loadboard">
              <span className="font-medium">{fmtUSD(load.loadboard_rate)}</span>
            </Field>
          </Section>

          <Section title="Notes">
            <p className="text-xs text-muted-foreground">
              Negotiation hints the agent reads at call time. Edit and save to update.
            </p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Floor, ceiling, detention policy, special instructions…"
              className="min-h-32"
            />
            <div className="flex items-center gap-2">
              <Button onClick={save} disabled={!dirty || saving}>
                {saving ? 'Saving…' : 'Save notes'}
              </Button>
              <Button
                variant="outline"
                disabled={!dirty || saving}
                onClick={() => setNotes(load.notes ?? '')}
              >
                Reset
              </Button>
            </div>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-baseline gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{children}</span>
    </div>
  );
}
