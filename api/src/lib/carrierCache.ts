// Per-session cache of the verify_carrier result. Populated by
// /carriers/verify when the agent passes a session_id, read by the webhook
// handler so the call row gets carrier_name (and mc_number, dot_number)
// even when HR doesn't template them into the webhook body.
//
// Keyed by session_id rather than mc_number because the same MC could be
// looked up across two different calls and we want each session to see
// only its own result. Single-instance only.

const TTL_MS = 60 * 60 * 1000; // 1 hour

type Entry = {
  mc_number: string;
  carrier_name: string;
  dot_number?: string;
  lastSeen: number;
};

const cache = new Map<string, Entry>();

function evictStale(now: number) {
  for (const [k, v] of cache) {
    if (now - v.lastSeen > TTL_MS) cache.delete(k);
  }
}

export function rememberCarrier(
  sessionId: string,
  mc_number: string,
  carrier_name: string,
  dot_number?: string,
): void {
  if (!sessionId || !carrier_name) return;
  const now = Date.now();
  evictStale(now);
  cache.set(sessionId, { mc_number, carrier_name, dot_number, lastSeen: now });
}

export function lookupCarrier(sessionId: string | null | undefined):
  | { mc_number: string; carrier_name: string; dot_number?: string }
  | null {
  if (!sessionId) return null;
  evictStale(Date.now());
  const e = cache.get(sessionId);
  if (!e) return null;
  return {
    mc_number: e.mc_number,
    carrier_name: e.carrier_name,
    dot_number: e.dot_number,
  };
}
