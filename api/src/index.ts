import express from 'express';
import { apiKeyAuth } from './auth.js';
import { requestLogger } from './lib/requestLogger.js';
import loadsRouter from './routes/loads.js';
import carriersRouter from './routes/carriers.js';
import callsRouter from './routes/calls.js';
import webhooksRouter from './routes/webhooks.js';

const app = express();
app.use(express.json({ limit: '1mb' }));
// Order matters: the body parser must run before the logger so req.body is
// populated by the time we print it. The logger must run before auth so we
// see 401s in the log too.
app.use(requestLogger);

// Health check is unauthenticated so Railway can probe it
app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// Webhooks live OUTSIDE the X-API-Key gate — HappyRobot won't know our key.
// They have their own optional shared-secret check inside the router.
app.use('/webhooks', webhooksRouter);

// Everything below requires X-API-Key
app.use(apiKeyAuth);
app.use('/loads', loadsRouter);
app.use('/carriers', carriersRouter);
app.use('/calls', callsRouter);

// Catch-all error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[unhandled]', err);
  res.status(500).json({ error: 'internal_error' });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`API listening on :${port}`));
