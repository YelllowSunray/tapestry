import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

let supabase: ReturnType<typeof createBrowserClient<Database>> | null = null;

if (typeof window !== 'undefined') {
  console.log('Initializing Supabase client...');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('Supabase URL:', supabaseUrl ? 'Present' : 'Missing');
  console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey
    });
  } else {
    try {
      supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
      console.log('Supabase client initialized successfully');
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
    }
  }
}

export { supabase }; 