import { Router } from 'express';
import { callsService } from '../services/callsService.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

// Calls are ingested via POST /webhooks/happyrobot. This route is read-only
// — it backs the dashboard's calls list.
router.get('/', asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit ?? 100);
  const calls = await callsService.listRecent(limit);
  res.json({ count: calls.length, calls });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const ok = await callsService.deleteCall(String(req.params.id));
  if (!ok) return res.status(404).json({ error: 'call not found' });
  res.json({ ok: true });
}));

export default router;
