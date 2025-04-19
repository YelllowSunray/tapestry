import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

let supabase: ReturnType<typeof createBrowserClient<Database>> | null = null;

if (typeof window !== 'undefined') {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
  } else {
    try {
      supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
    }
  }
}

export { supabase }; 