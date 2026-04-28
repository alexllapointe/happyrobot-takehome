import { forwardJson } from '@/lib/server-api';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ load_id: string }> },
) {
  const { load_id } = await params;
  const body = await req.json().catch(() => ({}));
  return forwardJson('PATCH', `/loads/${encodeURIComponent(load_id)}`, body);
}
