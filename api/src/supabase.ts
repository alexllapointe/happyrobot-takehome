import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Lazy client. We deferred the env-var check until the first actual call so
// importing any module that transitively imports this file doesn't crash
// when SUPABASE_* aren't set (e.g. inside unit tests for pure functions).

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars missing');
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return Reflect.get(getClient(), prop, getClient());
  },
});
