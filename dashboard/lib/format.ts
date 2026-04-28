export const fmtUSD = (n: number | null | undefined) =>
  n == null
    ? '—'
    : `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export const truncate = (s: string | null | undefined, n = 80) =>
  !s ? '—' : s.length <= n ? s : s.slice(0, n - 1) + '…';

// First N words + ellipsis. Used for the summary cell in the calls table —
// the full text lives in the row detail Sheet.
export const truncateWords = (s: string | null | undefined, n = 4) => {
  if (!s) return '—';
  const words = s.trim().split(/\s+/);
  if (words.length <= n) return s.trim();
  return words.slice(0, n).join(' ') + '…';
};

export const fmtPct = (p: number) => `${p.toFixed(0)}%`;
