import { supabase } from '../supabase.js';

export type CallOutcome =
  | 'booked'
  | 'declined_by_carrier'
  | 'no_agreement'
  | 'carrier_ineligible'
  | 'no_matching_load'
  | 'abandoned';

export type CallSentiment = 'positive' | 'neutral' | 'negative';

export type CallInsert = {
  call_id?: string;
  session_id?: string;
  mc_number?: string;
  carrier_name?: string;
  load_id?: string;
  outcome: CallOutcome;
  sentiment?: CallSentiment;
  initial_rate?: number;
  final_rate?: number;
  num_offers?: number;
  transcript_summary?: string;
  duration_seconds?: number;
  caller_number?: string;
  decline_reason?: string;
  ai_summary?: string;
  ai_classification?: string;
  ai_topics?: string[];
  ai_follow_up?: boolean;
  ai_extracted_at?: string;
};

export type CallRow = CallInsert & {
  id: string;
  created_at: string;
};

export const callsRepository = {
  async upsertBySessionId(input: CallInsert & { session_id: string }): Promise<CallRow> {
    const { data, error } = await supabase
      .from('calls')
      .upsert(input, { onConflict: 'session_id' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as CallRow;
  },

  async deleteById(id: string): Promise<boolean> {
    const { error, count } = await supabase
      .from('calls')
      .delete({ count: 'exact' })
      .eq('id', id);
    if (error) throw new Error(error.message);
    return (count ?? 0) > 0;
  },

  async listRecent(limit: number) {
    const { data, error } = await supabase
      .from('calls')
      .select('*, loads(origin, destination, equipment_type, loadboard_rate)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return data ?? [];
  },
};
