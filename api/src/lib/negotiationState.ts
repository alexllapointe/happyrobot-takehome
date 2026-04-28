// In-memory negotiation tracking, keyed by HR's session_id.
//
// Tracks:
//   - round: which counter we're on (1..3, hard cap)
//   - initial_rate: the carrier's first offer (set once on round 1)
//   - final_rate: the most recent rate the API decided on (counter_rate or
//     agreed_rate). Null until a decision is made; null after a reject.
//   - num_offers: same as round.
//
// The webhook consumes (and clears) this state when the call ends, so the
// dashboard sees full negotiation stats without the workflow author having
// to template them into the webhook body.
//
// Single-instance only — swap for Redis if we ever scale out.

const TTL_MS = 30 * 60 * 1000; // 30 minutes

type Entry = {
  round: number;
  initial_rate: number | null;
  final_rate: number | null;
  lastSeen: number;
};

export type NegotiationStats = {
  initial_rate: number | null;
  final_rate: number | null;
  num_offers: number;
};

const state = new Map<string, Entry>();

function evictStale(now: number) {
  for (const [k, v] of state) {
    if (now - v.lastSeen > TTL_MS) state.delete(k);
  }
}

function getOrCreate(sessionId: string): Entry {
  const now = Date.now();
  evictStale(now);
  let e = state.get(sessionId);
  if (!e) {
    e = { round: 0, initial_rate: null, final_rate: null, lastSeen: now };
    state.set(sessionId, e);
  } else {
    e.lastSeen = now;
  }
  return e;
}

// Records a new offer from the carrier. Returns the new round number. On
// the first offer of a session we ALSO capture the broker's posted rate as
// `initial_rate` so the dashboard's "Initial offer" column shows the
// listing price (not the carrier's first ask).
export function recordOffer(
  sessionId: string,
  _offer: number,
  postedRate?: number,
): number {
  const e = getOrCreate(sessionId);
  if (e.round === 0 && postedRate != null) e.initial_rate = postedRate;
  e.round = Math.min(e.round + 1, 3);
  return e.round;
}

// Records the rate the API just decided on (counter_rate or agreed_rate).
// Pass null when the decision was a reject.
export function recordFinalRate(sessionId: string, rate: number | null): void {
  const e = state.get(sessionId);
  if (e) {
    e.final_rate = rate;
    e.lastSeen = Date.now();
  }
}

// Reads + clears the negotiation stats. Called from the webhook so a single
// session_id can't be consumed twice.
export function consumeStats(sessionId: string): NegotiationStats | null {
  const e = state.get(sessionId);
  if (!e) return null;
  state.delete(sessionId);
  return {
    initial_rate: e.initial_rate,
    final_rate: e.final_rate,
    num_offers: e.round,
  };
}

// Test/debug helper.
export function _peek(sessionId: string): Entry | null {
  return state.get(sessionId) ?? null;
}
