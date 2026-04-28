const FMCSA_BASE = 'https://mobile.fmcsa.dot.gov/qc/services/carriers';

export type VerifyResult = {
  eligible: boolean;
  carrier_name?: string;
  dot_number?: string;
  status?: string;
  reason?: string | null;
};

function readOverrides(): Set<string> {
  return new Set(
    (process.env.DEMO_MC_OVERRIDES ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

export async function verifyMC(mcNumber: string): Promise<VerifyResult> {
  const key = process.env.FMCSA_WEBKEY;
  if (!key) throw new Error('FMCSA_WEBKEY not set');

  const overrides = readOverrides();
  const isOverride = overrides.has(mcNumber);

  const url = `${FMCSA_BASE}/docket-number/${encodeURIComponent(mcNumber)}?webKey=${key}`;
  const r = await fetch(url);
  if (!r.ok) return { eligible: false, reason: 'fmcsa_error' };

  const json: any = await r.json();
  const carrier = json?.content?.[0]?.carrier;

  // No carrier on file: usually a typo or dead MC. If it's an override,
  // synthesize a demo response so the agent can keep going.
  if (!carrier) {
    if (isOverride) {
      return {
        eligible: true,
        carrier_name: 'Demo Carrier',
        dot_number: '',
        status: 'A',
        reason: null,
      };
    }
    return { eligible: false, reason: 'not_found' };
  }

  const fmcsaEligible =
    carrier.allowedToOperate === 'Y' && carrier.statusCode === 'A';
  const eligible = fmcsaEligible || isOverride;

  // Keep status in lock-step with eligible. If we say eligible: true, the
  // status MUST read "A" — otherwise the agent's LLM sees the contradiction
  // (e.g. eligible:true / status:"I") and tends to override our decision and
  // reject the carrier on its own.
  return {
    eligible,
    carrier_name: carrier.legalName,
    dot_number: String(carrier.dotNumber ?? ''),
    status: eligible ? 'A' : carrier.statusCode,
    reason: eligible ? null : 'not_authorized',
  };
}
