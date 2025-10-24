import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton instance to prevent multiple client creation
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const supabase = (() => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Use a consistent storage key
      storageKey: 'eduportal-auth',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      // Prevent automatic token refresh in callback route
      flowType: 'pkce',
    },
  });

  return supabaseInstance;
})();