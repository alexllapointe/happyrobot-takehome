// Server-only helper used by Next.js route handlers in app/api/*. Reads the
// API_BASE_URL and API_KEY from server env (no NEXT_PUBLIC_ prefix) and
// forwards the request to the Express API.
import 'server-only';

const BASE = process.env.API_BASE_URL;
const KEY = process.env.API_KEY;

function notConfigured(): Response {
  return new Response(
    JSON.stringify({ error: 'API_BASE_URL or API_KEY not configured' }),
    { status: 500, headers: { 'content-type': 'application/json' } },
  );
}

function passthrough(upstream: Response): Response {
  const ct = upstream.headers.get('content-type') ?? 'application/json';
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'content-type': ct },
  });
}

export async function forwardGet(path: string): Promise<Response> {
  if (!BASE || !KEY) return notConfigured();
  const upstream = await fetch(`${BASE}${path}`, {
    headers: { 'x-api-key': KEY },
    cache: 'no-store',
  });
  return passthrough(upstream);
}

export async function forwardJson(
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  path: string,
  body: unknown,
): Promise<Response> {
  if (!BASE || !KEY) return notConfigured();
  const upstream = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'x-api-key': KEY, 'content-type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  return passthrough(upstream);
}
