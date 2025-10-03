import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config.js';

/**
 * Supabase client configuration
 * Uses centralized configuration management
 */

// Create Supabase client for client-side operations
export const supabase: SupabaseClient = createClient(
  config.database.supabase.url, 
  config.database.supabase.anonKey
);

// Create Supabase client for server-side operations (with service role key)
export const supabaseAdmin: SupabaseClient = createClient(
  config.database.supabase.url, 
  config.database.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default supabase;

