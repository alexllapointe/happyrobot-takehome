// Pull broker-side floor/ceiling out of free-text notes.
//
// Patterns we tolerate (case-insensitive, $ optional, commas optional):
//   "Floor: $1700"               -> floor = 1700
//   "Floor $750"                 -> floor = 750
//   "Ceiling $1600"              -> ceiling = 1600
//   "$2650 ceiling"              -> ceiling = 2650
//   "Authorized to $2650"        -> ceiling = 2650 (broker's max)
//   "broker authorized to $2650 ceiling"  -> ceiling = 2650
//   "Hard cap $950"              -> ceiling = 950
//
// Anything we can't parse falls back to ±10% of the loadboard rate at the
// caller, so a load with sparse notes still negotiates sensibly.

export type ParsedRates = {
  floor: number | null;
  ceiling: number | null;
};

const NUMBER = '\\$?\\s*([\\d,]+)';

const FLOOR_PATTERNS: RegExp[] = [
  new RegExp(`floor\\s*[:\\s]\\s*${NUMBER}`, 'i'),
];

const CEILING_PATTERNS: RegExp[] = [
  new RegExp(`authorized\\s+to\\s+${NUMBER}`, 'i'),
  new RegExp(`hard\\s+cap\\s*[:\\s]?\\s*${NUMBER}`, 'i'),
  new RegExp(`ceiling\\s*[:\\s]?\\s*${NUMBER}`, 'i'),
  new RegExp(`${NUMBER}\\s*ceiling`, 'i'),
  new RegExp(`(?<!hard\\s)cap\\s*[:\\s]?\\s*${NUMBER}`, 'i'),
];

function firstMatch(text: string, patterns: RegExp[]): number | null {
  for (const re of patterns) {
    const m = text.match(re);
    if (m && m[1]) {
      const n = Number(m[1].replace(/,/g, ''));
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return null;
}

export function parseLoadNotes(notes: string | null | undefined): ParsedRates {
  if (!notes) return { floor: null, ceiling: null };
  return {
    floor: firstMatch(notes, FLOOR_PATTERNS),
    ceiling: firstMatch(notes, CEILING_PATTERNS),
  };
}
