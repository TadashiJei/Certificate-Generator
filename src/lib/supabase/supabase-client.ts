import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';

// Create a single instance of the Supabase client
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);
