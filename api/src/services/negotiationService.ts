import { loadsRepository } from '../repositories/loadsRepository.js';
import { parseLoadNotes } from '../lib/parseLoadNotes.js';
import { recordFinalRate, recordOffer } from '../lib/negotiationState.js';

export const MAX_ROUNDS = 3;
export const REJECT_OVER_PCT = 0.15; // >15% above ceiling = wildly off, reject

export type NegotiationOutcome =
  | { decision: 'accept'; agreed_rate: number; round: number; max_rounds: number }
  | { decision: 'counter'; counter_rate: number; round: number; max_rounds: number }
  | {
      decision: 'reject';
      reason: 'over_ceiling';
      round: number;
      max_rounds: number;
    };

export type EvaluateError = { error: string };

export type DecisionInput = {
  posted: number;
  ceiling: number;
  offer: number;
  round: number;
};

export type DecisionResult =
  | { decision: 'accept'; agreed_rate: number }
  | { decision: 'counter'; counter_rate: number }
  | { decision: 'reject'; reason: 'over_ceiling' };

const roundToNearest25 = (n: number) => Math.round(n / 25) * 25;

// Pure decision tree — no IO, no side effects. Exported so unit tests can
// exercise every branch without a database.
export function decideNegotiation(input: DecisionInput): DecisionResult {
  const { posted, ceiling, offer, round } = input;

  // Carrier's ask is at or below our posted rate: take it.
  if (offer <= posted) return { decision: 'accept', agreed_rate: offer };

  // Negotiable zone (above posted, at or below ceiling).
  if (offer <= ceiling) {
    if (round >= MAX_ROUNDS) return { decision: 'accept', agreed_rate: offer };
    const midpoint = roundToNearest25((offer + posted) / 2);
    const counter = Math.min(midpoint, offer - 25);
    return { decision: 'counter', counter_rate: counter };
  }

  // Above ceiling. Reject if wildly above OR if rounds are spent.
  const overagePct = (offer - ceiling) / ceiling;
  if (overagePct > REJECT_OVER_PCT || round >= MAX_ROUNDS) {
    return { decision: 'reject', reason: 'over_ceiling' };
  }

  // Reasonable but above ceiling: hold the line at ceiling.
  return { decision: 'counter', counter_rate: ceiling };
}

export const negotiationService = {
  async evaluateOffer(
    sessionId: string,
    loadId: string,
    offer: number,
  ): Promise<NegotiationOutcome | EvaluateError> {
    if (!sessionId.trim()) return { error: 'session_id required' };
    if (!Number.isFinite(offer) || offer <= 0) return { error: 'invalid offer' };

    const load = await loadsRepository.findById(loadId);
    if (!load) return { error: 'load not found' };

    const posted = Number(load.loadboard_rate);
    const { ceiling: parsedCeiling } = parseLoadNotes(load.notes);
    const ceiling = parsedCeiling ?? Math.round(posted * 1.1);

    // Track this offer as round N. On round 1 the posted rate is captured
    // as initial_rate (the broker's listing price), so the dashboard's
    // "Initial offer" cell shows what we put up rather than the carrier's
    // first counter. State persists past accept/reject so the end-of-call
    // webhook can read and clear it.
    const round = recordOffer(sessionId, offer, posted);

    const result = decideNegotiation({ posted, ceiling, offer, round });

    if (result.decision === 'accept') {
      recordFinalRate(sessionId, result.agreed_rate);
      return { ...result, round, max_rounds: MAX_ROUNDS };
    }
    if (result.decision === 'counter') {
      recordFinalRate(sessionId, result.counter_rate);
      return { ...result, round, max_rounds: MAX_ROUNDS };
    }
    // reject
    recordFinalRate(sessionId, null);
    return { ...result, round, max_rounds: MAX_ROUNDS };
  },
};
