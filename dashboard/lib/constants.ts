import type { Outcome, Sentiment } from './types';

export const OUTCOME_LABELS: Record<Outcome, string> = {
  booked: 'Booked',
  declined_by_carrier: 'Declined',
  no_agreement: 'No agreement',
  carrier_ineligible: 'Ineligible',
  no_matching_load: 'No match',
  abandoned: 'Abandoned',
};

// Grayscale ramp — keeps the palette black-and-white while still giving each
// outcome a distinguishable swatch in the breakdown table.
export const OUTCOME_COLORS: Record<Outcome, string> = {
  booked: '#0a0a0a',
  declined_by_carrier: '#404040',
  no_agreement: '#737373',
  carrier_ineligible: '#525252',
  no_matching_load: '#a3a3a3',
  abandoned: '#d4d4d4',
};

export const SENTIMENT_COLORS: Record<Sentiment, string> = {
  positive: '#0a0a0a',
  neutral: '#737373',
  negative: '#d4d4d4',
};

export const ALL_OUTCOMES: Outcome[] = [
  'booked',
  'declined_by_carrier',
  'no_agreement',
  'carrier_ineligible',
  'no_matching_load',
  'abandoned',
];

export const ALL_SENTIMENTS: Sentiment[] = ['positive', 'neutral', 'negative'];
