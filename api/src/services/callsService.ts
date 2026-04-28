import {
  callsRepository,
  type CallInsert,
  type CallOutcome,
  type CallSentiment,
} from '../repositories/callsRepository.js';
import {
  asBool,
  asNumber,
  asString,
  asStringArray,
  pluck,
} from '../lib/pluck.js';
import { consumeStats } from '../lib/negotiationState.js';
import { lookupCarrier } from '../lib/carrierCache.js';
import { verifyMC } from '../lib/fmcsa.js';
import { loadsRepository } from '../repositories/loadsRepository.js';

const VALID_OUTCOMES: ReadonlyArray<CallOutcome> = [
  'booked',
  'declined_by_carrier',
  'no_agreement',
  'carrier_ineligible',
  'no_matching_load',
  'abandoned',
];
const VALID_SENTIMENTS: ReadonlyArray<CallSentiment> = ['positive', 'neutral', 'negative'];

function asOutcome(v: unknown): CallOutcome | null {
  return typeof v === 'string' && (VALID_OUTCOMES as ReadonlyArray<string>).includes(v)
    ? (v as CallOutcome)
    : null;
}
function asSentiment(v: unknown): CallSentiment | null {
  return typeof v === 'string' && (VALID_SENTIMENTS as ReadonlyArray<string>).includes(v)
    ? (v as CallSentiment)
    : null;
}

// Derive our outcome enum from HR's `classification` (the Classify node's
// label). HR's Classify node always fires at end-of-call, so this is the
// only signal we need. Matching is case- and whitespace-insensitive and
// tolerates a few common misspellings seen in the wild ("Sucess", etc.).
// Exported for unit tests.
export function deriveOutcome(classification: string | null): CallOutcome | null {
  const klass = (classification ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  if (!klass) return null;

  if (klass.includes('success') || klass.includes('sucess') || klass.includes('booked'))
    return 'booked';
  if (klass.includes('ineligible') || klass.includes('not authorized') || klass.includes('inactive'))
    return 'carrier_ineligible';
  if (klass.includes('no match') || klass.includes('no load'))
    return 'no_matching_load';
  if (klass.includes('rate')) return 'no_agreement';
  if (klass.includes('not interested') || klass.includes('declined'))
    return 'declined_by_carrier';
  if (klass.includes('abandon')) return 'abandoned';
  return null;
}

export const callsService = {
  listRecent(limit: number) {
    const capped = Math.min(Math.max(limit, 1), 500);
    return callsRepository.listRecent(capped);
  },

  deleteCall(id: string) {
    return callsRepository.deleteById(id);
  },
  async applyWebhook(
    body: unknown,
  ): Promise<{ ok: boolean; reason?: string; id?: string }> {
    const sessionId = asString(pluck(body, 'session_id', 'sessionId'));
    if (!sessionId) return { ok: false, reason: 'missing session_id' };

    const tracked = consumeStats(sessionId);

    // Outcome resolution: prefer an explicit `outcome` field if it matches
    // our enum, otherwise derive from HR's `classification` (the Classify
    // node's label).
    const classification = asString(
      pluck(body, 'classification', 'ai_classification', 'category'),
    );
    const outcome =
      asOutcome(pluck(body, 'outcome')) ?? deriveOutcome(classification);
    if (!outcome) {
      return { ok: false, reason: 'missing/invalid outcome and no classification' };
    }

    const declineReason = asString(pluck(body, 'decline_reason', 'declineReason'));
    // ai_summary in the table comes from classification_reasoning; if a
    // decline reason exists, append it so the cell tells the whole story.
    const reasoning = asString(pluck(body, 'classification_reasoning', 'classificationReasoning'));
    const summaryFromHR = asString(pluck(body, 'summary', 'ai_summary'));
    const composedFallback =
      [reasoning, declineReason ? `Decline reason: ${declineReason}` : null]
        .filter(Boolean)
        .join(' ') || null;
    const composedSummary = summaryFromHR ?? composedFallback;

    const aiTopics = asStringArray(pluck(body, 'topics', 'ai_topics', 'tags'));
    const aiFollowUp = asBool(
      pluck(body, 'follow_up', 'ai_follow_up', 'needs_follow_up'),
    );
    const hasAi =
      composedSummary != null ||
      classification != null ||
      aiTopics != null ||
      aiFollowUp != null;

    // Fallback chain for carrier_name:
    //   1. webhook payload (rare — HR doesn't template it by default)
    //   2. session cache populated by /carriers/verify (the normal path)
    //   3. live FMCSA lookup using the mc_number from the webhook body
    //      (last-resort safety net for a missed cache or stale TTL)
    // The mc_number itself follows the same chain minus the FMCSA call.
    const cached = lookupCarrier(sessionId);
    const mcNumber =
      asString(pluck(body, 'mc_number', 'mcNumber')) ??
      cached?.mc_number ??
      undefined;
    let carrierName =
      asString(pluck(body, 'carrier_name', 'carrierName')) ??
      cached?.carrier_name ??
      undefined;

    if (!carrierName && mcNumber) {
      try {
        const fmcsa = await verifyMC(mcNumber.replace(/\D/g, ''));
        if (fmcsa.carrier_name) carrierName = fmcsa.carrier_name;
      } catch (e) {
        // Don't fail the webhook over an enrichment miss.
        console.warn('[webhook] FMCSA fallback failed:', (e as Error).message);
      }
    }

    // Load id: validate against the DB. If HR's reference_number doesn't
    // match a real load we set it to null instead of crashing on the FK —
    // the call still gets recorded, the row just isn't linked to a load.
    // We also keep the resolved posted rate around as a fallback for the
    // negotiation-stat columns when no negotiation actually happened.
    let loadId =
      asString(pluck(body, 'load_id', 'loadId', 'reference_number', 'referenceNumber')) ??
      undefined;
    let loadPosted: number | null = null;
    if (loadId) {
      const found = await loadsRepository.findById(loadId);
      if (!found) {
        console.warn(`[webhook] load_id "${loadId}" not in loads table — dropping FK reference`);
        loadId = undefined;
      } else {
        loadPosted = Number(found.loadboard_rate);
      }
    }

    const sentiment =
      asSentiment(
        pluck(body, 'sentiment', 'carrier_sentiment', 'sentimentClassification'),
      ) ?? undefined;
    if (!sentiment) {
      console.warn('[webhook] no sentiment in payload (looked at: sentiment, carrier_sentiment, sentimentClassification)');
    }

    const insert: CallInsert & { session_id: string } = {
      session_id: sessionId,
      mc_number: mcNumber,
      carrier_name: carrierName,
      load_id: loadId,
      outcome,
      sentiment,
      // Negotiation columns. Order of precedence:
      //   1. tracked stats from evaluate_offer (real negotiation happened)
      //   2. webhook body fields (HR templated them)
      //   3. fallback to the load's posted rate so calls that ended without
      //      a negotiation (carrier accepted posted, or declined outright)
      //      still show what we listed at instead of a row of em-dashes.
      initial_rate:
        tracked?.initial_rate ??
        asNumber(pluck(body, 'initial_rate', 'initialRate')) ??
        loadPosted ??
        undefined,
      final_rate:
        tracked?.final_rate ??
        asNumber(pluck(body, 'final_rate', 'finalRate')) ??
        (outcome === 'booked' ? loadPosted : null) ??
        undefined,
      num_offers:
        (tracked && tracked.num_offers > 0 ? tracked.num_offers : null) ??
        asNumber(pluck(body, 'num_offers', 'numOffers', 'offers')) ??
        0,
      transcript_summary:
        asString(pluck(body, 'transcript_summary', 'transcript', 'transcriptSummary')) ??
        undefined,
      duration_seconds:
        asNumber(pluck(body, 'duration', 'duration_seconds', 'durationSeconds')) ?? undefined,
      caller_number:
        asString(pluck(body, 'caller_number', 'callerNumber', 'from_number')) ?? undefined,
      decline_reason: declineReason ?? undefined,
      ai_summary: composedSummary ?? undefined,
      ai_classification: classification ?? undefined,
      ai_topics: aiTopics ?? undefined,
      ai_follow_up: aiFollowUp ?? undefined,
      ai_extracted_at: hasAi ? new Date().toISOString() : undefined,
    };

    const row = await callsRepository.upsertBySessionId(insert);
    return { ok: true, id: row.id };
  },
};
