import { Router } from 'express';
import { carriersService } from '../services/carriersService.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

router.get('/verify', asyncHandler(async (req, res) => {
  const mc = String(req.query.mc_number ?? '');
  if (!mc.replace(/\D/g, '')) return res.status(400).json({ error: 'mc_number required' });
  // session_id is optional — when present we cache the verify result
  // against it so the end-of-call webhook can fill carrier_name without
  // HR having to template it into the workflow body.
  const sessionId = req.query.session_id ? String(req.query.session_id) : undefined;
  res.json(await carriersService.verifyCarrier(mc, sessionId));
}));

export default router;
