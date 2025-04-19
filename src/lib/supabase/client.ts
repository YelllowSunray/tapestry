import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create the client if we're in the browser and have the required variables
let supabase: ReturnType<typeof createBrowserClient<Database>> | null = null

if (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('Error initializing Supabase client:', error)
  }
}

export { supabase } 