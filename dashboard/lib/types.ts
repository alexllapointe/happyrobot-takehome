export type Outcome =
  | 'booked'
  | 'declined_by_carrier'
  | 'no_agreement'
  | 'carrier_ineligible'
  | 'no_matching_load'
  | 'abandoned';

export type Sentiment = 'positive' | 'neutral' | 'negative';

export type LoadSummary = {
  origin: string;
  destination: string;
  equipment_type: string;
  loadboard_rate: number;
};

export type CallRow = {
  id: string;
  call_id: string | null;
  session_id: string | null;
  mc_number: string | null;
  carrier_name: string | null;
  load_id: string | null;
  outcome: Outcome;
  sentiment: Sentiment | null;
  initial_rate: number | null;
  final_rate: number | null;
  num_offers: number | null;
  transcript_summary: string | null;
  duration_seconds: number | null;
  caller_number: string | null;
  decline_reason: string | null;
  ai_summary: string | null;
  ai_classification: string | null;
  ai_topics: string[] | null;
  ai_follow_up: boolean | null;
  ai_extracted_at: string | null;
  created_at: string;
  loads?: LoadSummary | null;
};

export type LoadRow = {
  load_id: string;
  origin: string;
  destination: string;
  pickup_datetime: string;
  delivery_datetime: string;
  equipment_type: string;
  loadboard_rate: number;
  miles: number | null;
  weight: number | null;
  commodity_type: string | null;
  num_of_pieces: number | null;
  dimensions: string | null;
  notes: string | null;
  created_at: string;
};

export type Kpis = {
  total: number;
  booked: number;
  bookingRate: number; // percent
  avgFinal: number | null;
  avgOffers: number | null;
  avgUplift: number | null; // avg (final - initial) on booked calls
};

export type CountByLabel = {
  key: string;
  label: string;
  value: number;
  color: string;
};

export type EquipmentBreakdownRow = {
  equipment_type: string;
  calls: number;
  booked: number;
  bookingRate: number;
  avgFinal: number | null;
};

export type LaneBreakdownRow = {
  lane: string;
  calls: number;
  booked: number;
  bookingRate: number;
  avgFinal: number | null;
};

export type OutcomeBreakdownRow = {
  outcome: Outcome;
  label: string;
  count: number;
  share: number; // percent
};

export type DailyCount = {
  date: string;
  label: string;
  count: number;
};
