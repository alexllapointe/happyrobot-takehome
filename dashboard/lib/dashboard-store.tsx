'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { createClient, type RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { api } from './api';
import type { CallRow, LoadRow } from './types';

type StoreValue = {
  calls: CallRow[];
  loads: LoadRow[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setCalls: Dispatch<SetStateAction<CallRow[]>>;
  setLoads: Dispatch<SetStateAction<LoadRow[]>>;
};

const StoreContext = createContext<StoreValue | null>(null);

// Single Supabase client for realtime invalidation only — never used to read
// row data. Returns null if env vars are missing so dev mode without
// realtime keys still boots cleanly.
function maybeRealtimeClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export function DashboardStoreProvider({ children }: { children: React.ReactNode }) {
  const [calls, setCalls] = useState<CallRow[]>([]);
  const [loads, setLoads] = useState<LoadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Coalesce rapid invalidations from realtime so a burst of inserts only
  // triggers one refetch. Trailing-edge debounce.
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refetch = useCallback(async () => {
    try {
      const [callsRes, loadsRes] = await Promise.all([api.calls(), api.loads()]);
      setCalls(callsRes.calls ?? []);
      setLoads(loadsRes.loads ?? []);
      setError(null);
    } catch (e) {
      const message = (e as Error).message;
      setError(message);
      toast.error('Could not load dashboard data', { description: message });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch. Runs once for the lifetime of the provider — pages mount
  // and unmount but the cache persists.
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Realtime channel: subscribe to calls + loads tables, kick a debounced
  // refetch on any change. We never read the row payload — the API is the
  // source of truth, this is just a tickle.
  useEffect(() => {
    const client = maybeRealtimeClient();
    if (!client) return;

    const scheduleRefetch = () => {
      if (refetchTimer.current) clearTimeout(refetchTimer.current);
      refetchTimer.current = setTimeout(() => {
        refetch();
      }, 250);
    };

    const channel: RealtimeChannel = client
      .channel('dashboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'calls' },
        scheduleRefetch,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loads' },
        scheduleRefetch,
      )
      .subscribe();

    return () => {
      if (refetchTimer.current) clearTimeout(refetchTimer.current);
      client.removeChannel(channel);
    };
  }, [refetch]);

  return (
    <StoreContext.Provider
      value={{ calls, loads, loading, error, refetch, setCalls, setLoads }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useDashboardStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useDashboardStore must be used within DashboardStoreProvider');
  }
  return ctx;
}
