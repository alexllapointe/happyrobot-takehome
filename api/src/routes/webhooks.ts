import { Router, type Request, type Response, type NextFunction } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { callsService } from '../services/callsService.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

// Optional shared-secret guard. HR's webhook UI typically lets you set a
// custom header; pick whichever name you configure there. If
// HAPPY_ROBOT_WEBHOOK_SECRET is unset, the endpoint is open — fine for local
// dev, NOT fine for production. Set it before pointing HR at the URL.
function webhookAuth(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.HAPPY_ROBOT_WEBHOOK_SECRET;
  if (!expected) return next();
  const provided =
    req.header('x-webhook-secret') ??
    req.header('x-happyrobot-signature') ??
    req.header('authorization')?.replace(/^Bearer\s+/i, '') ??
    '';
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'unauthorized webhook' });
  }
  next();
}

router.post(
  '/happyrobot',
  webhookAuth,
  asyncHandler(async (req, res) => {
    const result = await callsService.applyWebhook(req.body);
    if (!result.ok) {
      // Bad payload from HR — return 400 so the run is visibly failed in
      // their dashboard. We do NOT 5xx because that would trigger HR's
      // retry logic and we'd just keep failing on the same payload.
      console.warn('[webhook] rejected:', result.reason);
      return res.status(400).json({ error: result.reason });
    }
    res.json(result);
  }),
);

export default router;
