import { forwardGet } from '@/lib/server-api';

export const dynamic = 'force-dynamic';

export async function GET() {
  return forwardGet('/loads');
}
