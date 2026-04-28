import { timingSafeEqual } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const provided = req.header('x-api-key') ?? '';
  const expected = process.env.API_KEY ?? '';
  if (!expected) {
    return res.status(500).json({ error: 'API_KEY not configured' });
  }
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}
