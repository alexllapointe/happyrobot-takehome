import { forwardGet } from '@/lib/server-api';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = url.searchParams.get('limit') ?? '500';
  return forwardGet(`/calls?limit=${encodeURIComponent(limit)}`);
}
