import { supabase } from '../supabase.js';

export type Load = {
  load_id: string;
  origin: string;
  destination: string;
  pickup_datetime: string;
  delivery_datetime: string;
  equipment_type: string;
  loadboard_rate: number;
  notes: string | null;
  weight: number | null;
  commodity_type: string | null;
  num_of_pieces: number | null;
  miles: number | null;
  dimensions: string | null;
  created_at: string;
};

export type LoadSearchFilters = {
  origin?: string;
  destination?: string;
  equipment_type?: string;
  pickup_after?: string;
  reference_number?: string;
  limit?: number;
};

export const loadsRepository = {
  async search(filters: LoadSearchFilters): Promise<Load[]> {
    if (filters.reference_number) {
      const { data, error } = await supabase
        .from('loads')
        .select('*')
        .ilike('load_id', filters.reference_number)
        .limit(1);
      if (error) throw new Error(error.message);
      return (data ?? []) as Load[];
    }

    const limit = filters.limit ?? 5;
    let q = supabase.from('loads').select('*').limit(limit);
    if (filters.origin) q = q.ilike('origin', `%${filters.origin}%`);
    if (filters.destination) q = q.ilike('destination', `%${filters.destination}%`);
    if (filters.equipment_type) q = q.ilike('equipment_type', `%${filters.equipment_type}%`);
    if (filters.pickup_after) q = q.gte('pickup_datetime', filters.pickup_after);

    const { data, error } = await q.order('pickup_datetime', { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as Load[];
  },

  async listAll(): Promise<Load[]> {
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .order('pickup_datetime', { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as Load[];
  },

  async findById(loadId: string): Promise<Load | null> {
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .eq('load_id', loadId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Load) ?? null;
  },

  async updateNotes(loadId: string, notes: string | null): Promise<Load | null> {
    const { data, error } = await supabase
      .from('loads')
      .update({ notes })
      .eq('load_id', loadId)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Load) ?? null;
  },
};
