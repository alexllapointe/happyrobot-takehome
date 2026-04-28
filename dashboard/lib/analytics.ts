import type {
  CallRow,
  CountByLabel,
  DailyCount,
  EquipmentBreakdownRow,
  Kpis,
  LaneBreakdownRow,
  Outcome,
  OutcomeBreakdownRow,
  Sentiment,
} from './types';
import {
  ALL_OUTCOMES,
  ALL_SENTIMENTS,
  OUTCOME_COLORS,
  OUTCOME_LABELS,
  SENTIMENT_COLORS,
} from './constants';

export function computeKpis(calls: CallRow[]): Kpis {
  const total = calls.length;
  const booked = calls.filter((c) => c.outcome === 'booked').length;

  const finals = calls
    .filter((c) => c.outcome === 'booked' && c.final_rate != null)
    .map((c) => Number(c.final_rate));
  const avgFinal = finals.length ? finals.reduce((a, b) => a + b, 0) / finals.length : null;

  const offers = calls
    .filter((c) => c.num_offers != null)
    .map((c) => Number(c.num_offers));
  const avgOffers = offers.length ? offers.reduce((a, b) => a + b, 0) / offers.length : null;

  const uplifts = calls
    .filter((c) => c.outcome === 'booked' && c.initial_rate != null && c.final_rate != null)
    .map((c) => Number(c.final_rate) - Number(c.initial_rate));
  const avgUplift = uplifts.length ? uplifts.reduce((a, b) => a + b, 0) / uplifts.length : null;

  return {
    total,
    booked,
    bookingRate: total ? (booked / total) * 100 : 0,
    avgFinal,
    avgOffers,
    avgUplift,
  };
}

export function outcomeCounts(calls: CallRow[]): CountByLabel[] {
  const counts: Record<string, number> = {};
  for (const c of calls) counts[c.outcome] = (counts[c.outcome] ?? 0) + 1;
  return ALL_OUTCOMES
    .filter((o) => (counts[o] ?? 0) > 0)
    .map((o) => ({
      key: o,
      label: OUTCOME_LABELS[o],
      value: counts[o] ?? 0,
      color: OUTCOME_COLORS[o],
    }));
}

export function sentimentCounts(calls: CallRow[]): CountByLabel[] {
  const counts: Record<Sentiment, number> = { positive: 0, neutral: 0, negative: 0 };
  for (const c of calls) if (c.sentiment) counts[c.sentiment] += 1;
  return ALL_SENTIMENTS.map((s) => ({
    key: s,
    label: s.charAt(0).toUpperCase() + s.slice(1),
    value: counts[s],
    color: SENTIMENT_COLORS[s],
  }));
}

export function callsOverTime(calls: CallRow[], days = 14): DailyCount[] {
  const out: DailyCount[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      count: 0,
    });
  }
  for (const c of calls) {
    const iso = new Date(c.created_at).toISOString().slice(0, 10);
    const bucket = out.find((d) => d.date === iso);
    if (bucket) bucket.count += 1;
  }
  return out;
}

export function outcomeBreakdown(calls: CallRow[]): OutcomeBreakdownRow[] {
  const total = calls.length || 1;
  const counts: Record<Outcome, number> = {
    booked: 0,
    declined_by_carrier: 0,
    no_agreement: 0,
    carrier_ineligible: 0,
    no_matching_load: 0,
    abandoned: 0,
  };
  for (const c of calls) counts[c.outcome] += 1;
  return ALL_OUTCOMES.map((o) => ({
    outcome: o,
    label: OUTCOME_LABELS[o],
    count: counts[o],
    share: (counts[o] / total) * 100,
  }));
}

export function equipmentBreakdown(calls: CallRow[]): EquipmentBreakdownRow[] {
  const groups = new Map<string, CallRow[]>();
  for (const c of calls) {
    const key = c.loads?.equipment_type ?? 'Unknown';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(c);
  }
  const rows: EquipmentBreakdownRow[] = [];
  for (const [equipment_type, group] of groups) {
    const booked = group.filter((c) => c.outcome === 'booked');
    const finals = booked
      .filter((c) => c.final_rate != null)
      .map((c) => Number(c.final_rate));
    rows.push({
      equipment_type,
      calls: group.length,
      booked: booked.length,
      bookingRate: group.length ? (booked.length / group.length) * 100 : 0,
      avgFinal: finals.length ? finals.reduce((a, b) => a + b, 0) / finals.length : null,
    });
  }
  return rows.sort((a, b) => b.calls - a.calls);
}

export function laneBreakdown(calls: CallRow[]): LaneBreakdownRow[] {
  const groups = new Map<string, CallRow[]>();
  for (const c of calls) {
    if (!c.loads) continue;
    const key = `${c.loads.origin} → ${c.loads.destination}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(c);
  }
  const rows: LaneBreakdownRow[] = [];
  for (const [lane, group] of groups) {
    const booked = group.filter((c) => c.outcome === 'booked');
    const finals = booked
      .filter((c) => c.final_rate != null)
      .map((c) => Number(c.final_rate));
    rows.push({
      lane,
      calls: group.length,
      booked: booked.length,
      bookingRate: group.length ? (booked.length / group.length) * 100 : 0,
      avgFinal: finals.length ? finals.reduce((a, b) => a + b, 0) / finals.length : null,
    });
  }
  return rows.sort((a, b) => b.calls - a.calls).slice(0, 10);
}
