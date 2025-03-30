// lib/supabase/server.js (or .ts)
import { createServerClient } from '@supabase/ssr';
// Remove 'import { cookies } from 'next/headers'' from here if it exists

// Modify createClient to accept the cookie store
// Add type hint if using TypeScript: (cookieStore: ReturnType<typeof import('next/headers').cookies>)
export function createClient(cookieStore) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        // Use the passed-in cookieStore for all operations
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          // Ensure you handle potential async nature IF NEEDED,
          // but typically set/remove are synchronous with next/headers
          try {
             cookieStore.set({ name, value, ...options });
          } catch (error) {
             // Log error if setting cookie fails
             console.error('Error setting cookie:', name, error);
          }
        },
        remove(name, options) {
           try {
             cookieStore.delete({ name, ...options });
           } catch (error) {
             // Log error if removing cookie fails
             console.error('Error removing cookie:', name, error);
           }
        },
      },
    }
  );
}

// Keep your createAdminClient function as is
import { createClient as createAdmin } from '@supabase/supabase-js';
export function createAdminClient() {
  // ... same code as before ...
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials for admin actions.');
  }
  return createAdmin(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
  });
}
