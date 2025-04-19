import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: ReturnType<typeof createBrowserClient> | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
} else if (process.env.NODE_ENV !== 'production') {
  console.warn('Missing Supabase environment variables. Supabase client will be null.')
} else {
  throw new Error('Missing Supabase environment variables')
}

export { supabase } 