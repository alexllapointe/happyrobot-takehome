import { Router } from 'express';
import { z } from 'zod';
import { loadsService } from '../services/loadsService.js';
import { negotiationService } from '../services/negotiationService.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

const searchSchema = z.object({
  origin: z.string().optional(),
  destination: z.string().optional(),
  equipment_type: z.string().optional(),
  pickup_after: z.string().optional(),
  reference_number: z.string().optional(),
});

const updateSchema = z.object({
  notes: z.string().nullable(),
});

const evaluateOfferSchema = z.object({
  session_id: z.string().min(1),
  offer: z.number().positive(),
});

router.get('/', asyncHandler(async (_req, res) => {
  const loads = await loadsService.listAllLoads();
  res.json({ count: loads.length, loads });
}));

router.get('/search', asyncHandler(async (req, res) => {
  const parsed = searchSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const loads = await loadsService.searchLoads(parsed.data);
  res.json({ count: loads.length, loads });
}));

router.get('/:load_id', asyncHandler(async (req, res) => {
  const load = await loadsService.getLoad(String(req.params.load_id));
  if (!load) return res.status(404).json({ error: 'load not found' });
  res.json(load);
}));

router.patch('/:load_id', asyncHandler(async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const load = await loadsService.updateNotes(String(req.params.load_id), parsed.data.notes);
  if (!load) return res.status(404).json({ error: 'load not found' });
  res.json(load);
}));

// Called by the HR voice agent every time the carrier counters. The server
// tracks rounds via an in-memory counter keyed by call_id, parses the load's
// hidden floor/ceiling out of the notes field, and returns a decision the
// agent just relays. Round 3 is the hard cap.
router.post('/:load_id/evaluate-offer', asyncHandler(async (req, res) => {
  const parsed = evaluateOfferSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const result = await negotiationService.evaluateOffer(
    parsed.data.session_id,
    String(req.params.load_id),
    parsed.data.offer,
  );
  if ('error' in result) {
    const status = result.error === 'load not found' ? 404 : 400;
    return res.status(status).json({ error: result.error });
  }
  res.json(result);
}));

export default router;
