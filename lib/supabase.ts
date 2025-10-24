import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Suppress the multiple instances warning in development
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Multiple GoTrueClient instances detected')
  ) {
    return; // Suppress this specific warning
  }
  originalWarn.apply(console, args);
};

// Use global window object to store singleton
const getSupabaseClient = () => {
  if (typeof window !== 'undefined') {
    // Browser: Store on window to survive hot reloads
    if (!(window as any).__supabaseClient) {
      (window as any).__supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'eduportal-auth',
          storage: window.localStorage,
          flowType: 'pkce',
        },
      });
    }
    return (window as any).__supabaseClient;
  } else {
    // Server: Create new instance (no warning on server)
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
};

export const supabase = getSupabaseClient();