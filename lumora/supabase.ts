import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export const getSupabase = () => {
  if (!supabaseClient) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return null;
    }
    
    try {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    } catch (err) {
      console.error('Failed to initialize Supabase:', err);
      return null;
    }
  }
  return supabaseClient;
};

// Export a proxy or placeholder to maintain compatibility if possible, 
// but it's safer to use getSupabase() where needed.
export const supabase = getSupabase();
