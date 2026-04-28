import { verifyMC, type VerifyResult } from '../lib/fmcsa.js';
import { rememberCarrier } from '../lib/carrierCache.js';

export const carriersService = {
  async verifyCarrier(
    mcNumber: string,
    sessionId?: string,
  ): Promise<VerifyResult> {
    const cleaned = mcNumber.replace(/\D/g, '');
    if (!cleaned) throw new Error('mc_number required');
    const result = await verifyMC(cleaned);

    // Cache by session_id so the webhook can fill in carrier_name later —
    // HR doesn't always template the verified name into the webhook body
    // and we already paid the FMCSA call once.
    if (sessionId && result.eligible && result.carrier_name) {
      rememberCarrier(sessionId, cleaned, result.carrier_name, result.dot_number);
    }

    return result;
  },
};
