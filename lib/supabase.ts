// import { createClient, SupabaseClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// // Suppress the multiple instances warning in development
// const originalWarn = console.warn;
// console.warn = (...args: unknown[]) => {
//   if (
//     typeof args[0] === 'string' &&
//     args[0].includes('Multiple GoTrueClient instances detected')
//   ) {
//     return; // Suppress this specific warning
//   }
//   originalWarn.apply(console, args);
// };

// // Extend the Window interface for TypeScript
// declare global {
//   interface Window {
//     __supabaseClient?: SupabaseClient;
//   }
// }

// // Use global window object to store singleton
// const getSupabaseClient = (): SupabaseClient => {
//   if (typeof window !== 'undefined') {
//     // Browser: Store on window to survive hot reloads
//     if (!window.__supabaseClient) {
//       window.__supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
//         auth: {
//           persistSession: true,
//           autoRefreshToken: true,
//           detectSessionInUrl: true,
//           storageKey: 'eduportal-auth',
//           storage: window.localStorage,
//           flowType: 'pkce',
//         },
//       });
//     }
//     return window.__supabaseClient;
//   } else {
//     // Server: Create new instance (no warning on server)
//     return createClient(supabaseUrl, supabaseAnonKey, {
//       auth: {
//         persistSession: false,
//         autoRefreshToken: false,
//         detectSessionInUrl: false,
//       },
//     });
//   }
// };

// export const supabase = getSupabaseClient();


import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Suppress specific warnings in development
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const message = String(args[0] || '');
  
  // Suppress these specific warnings
  if (
    message.includes('Multiple GoTrueClient instances detected') ||
    message.includes('sourceMapURL could not be parsed') ||
    message.includes('Invalid source map')
  ) {
    return;
  }
  
  originalWarn.apply(console, args);
};

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    __supabaseClient?: SupabaseClient;
  }
}

// Use global window object to store singleton
const getSupabaseClient = (): SupabaseClient => {
  if (typeof window !== 'undefined') {
    // Browser: Store on window to survive hot reloads
    if (!window.__supabaseClient) {
      window.__supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
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
    return window.__supabaseClient;
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