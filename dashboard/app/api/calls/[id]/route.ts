import { forwardJson } from '@/lib/server-api';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return forwardJson('DELETE', `/calls/${encodeURIComponent(id)}`, {});
}
