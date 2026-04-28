import type { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'node:crypto';

// Pretty per-request logger. One line for the incoming request, one for the
// response, both tagged with a short request id so concurrent requests are
// easy to follow. Bodies are logged in full up to MAX_BODY_PREVIEW bytes;
// headers we care about are surfaced explicitly with secrets masked so we
// don't leak API_KEY into Railway logs.

const MAX_BODY_PREVIEW = 4000;

function truncate(s: string, max = MAX_BODY_PREVIEW): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + `… [+${s.length - max} chars]`;
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

function maskSecret(v: string | undefined): string {
  if (!v) return '—';
  if (v.length <= 8) return '***';
  return `${v.slice(0, 4)}…${v.slice(-4)}`;
}

function summarizeHeaders(req: Request): string {
  const parts: string[] = [];
  const ct = req.header('content-type');
  if (ct) parts.push(`ct=${ct}`);
  const apiKey = req.header('x-api-key');
  if (apiKey) parts.push(`x-api-key=${maskSecret(apiKey)}`);
  const wh =
    req.header('x-webhook-secret') ??
    req.header('x-happyrobot-signature') ??
    req.header('authorization');
  if (wh) parts.push(`webhook-secret=${maskSecret(wh)}`);
  const ua = req.header('user-agent');
  if (ua) parts.push(`ua="${ua.slice(0, 60)}"`);
  return parts.length ? ` [${parts.join(' ')}]` : '';
}

function summarizeQuery(req: Request): string {
  const keys = Object.keys(req.query);
  if (keys.length === 0) return '';
  const params = new URLSearchParams();
  for (const k of keys) {
    const v = req.query[k];
    if (Array.isArray(v)) v.forEach((x) => params.append(k, String(x)));
    else if (v != null) params.append(k, String(v));
  }
  return `?${params.toString()}`;
}

function summarizeBody(req: Request): string {
  if (!req.body || (typeof req.body === 'object' && Object.keys(req.body).length === 0)) {
    return '';
  }
  return ` body=${truncate(safeStringify(req.body))}`;
}

// Only log routes the HappyRobot agent / platform actually hits — the tool
// calls and the end-of-call webhook. Dashboard reads (GET /calls, GET
// /loads, etc.) are noisy and not interesting for debugging the agent.
function isAgentRoute(req: Request): boolean {
  const path = req.path;
  if (path === '/carriers/verify') return true;
  if (path === '/loads/search') return true;
  if (path === '/webhooks/happyrobot') return true;
  if (req.method === 'POST' && /^\/loads\/[^/]+\/evaluate-offer$/.test(path)) {
    return true;
  }
  return false;
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  if (!isAgentRoute(req)) return next();

  const id = randomBytes(3).toString('hex');
  const started = Date.now();

  console.log(
    `[${id}] → ${req.method} ${req.path}${summarizeQuery(req)}${summarizeBody(req)}${summarizeHeaders(req)}`,
  );

  // Capture the JSON response body without breaking streaming/non-JSON paths.
  // We only log the response body for application/json responses.
  const origJson = res.json.bind(res);
  let captured: unknown;
  res.json = (body: unknown) => {
    captured = body;
    return origJson(body);
  };

  res.on('finish', () => {
    const ms = Date.now() - started;
    const tail =
      captured !== undefined ? ` body=${truncate(safeStringify(captured))}` : '';
    console.log(`[${id}] ← ${res.statusCode} ${req.method} ${req.path} ${ms}ms${tail}`);
  });

  next();
}
