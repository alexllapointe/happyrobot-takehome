// Loose-key field extraction. HR's webhook payloads (and trigger_run results)
// don't have a stable shape — different workflows produce different output
// nodes, and the platform sometimes wraps the user-defined output under
// `output`/`result`/`data`. These helpers tolerate that variability so the
// rest of the code only deals with our normalized AI field shape.

export function pluck(obj: unknown, ...keys: string[]): unknown {
  if (!obj || typeof obj !== 'object') return undefined;
  for (const key of keys) {
    const v = (obj as Record<string, unknown>)[key];
    if (v !== undefined) return v;
  }
  for (const wrapper of ['output', 'result', 'data', 'payload']) {
    const inner = (obj as Record<string, unknown>)[wrapper];
    if (inner) {
      const found = pluck(inner, ...keys);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

export function asString(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v : null;
}

export function asStringArray(v: unknown): string[] | null {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === 'string') {
    return v.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return null;
}

export function asBool(v: unknown): boolean | null {
  if (typeof v === 'boolean') return v;
  if (v === 'true') return true;
  if (v === 'false') return false;
  return null;
}

export function asNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim()) {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}
