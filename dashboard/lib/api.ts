// Client-side fetch helpers. These hit the Next.js route handlers under
// /api/*, which run server-side and forward to the Express API with the
// X-API-Key header. The browser never sees the API key.

import type { CallRow, LoadRow } from './types';

async function getJSON<T>(path: string): Promise<T> {
  const r = await fetch(path, { cache: 'no-store' });
  if (!r.ok) {
    const body = await r.text().catch(() => '');
    throw new Error(`GET ${path} → ${r.status} ${body}`);
  }
  return r.json() as Promise<T>;
}

export const api = {
  loads: () => getJSON<{ count: number; loads: LoadRow[] }>('/api/loads'),
  calls: (limit = 500) =>
    getJSON<{ count: number; calls: CallRow[] }>(`/api/calls?limit=${limit}`),
  deleteCall: async (id: string): Promise<void> => {
    const r = await fetch(`/api/calls/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!r.ok) {
      const body = await r.text().catch(() => '');
      throw new Error(`DELETE /api/calls/${id} → ${r.status} ${body}`);
    }
  },

  updateLoadNotes: async (loadId: string, notes: string | null): Promise<LoadRow> => {
    const r = await fetch(`/api/loads/${encodeURIComponent(loadId)}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    if (!r.ok) {
      const body = await r.text().catch(() => '');
      throw new Error(`PATCH /api/loads/${loadId} → ${r.status} ${body}`);
    }
    return r.json();
  },
};
