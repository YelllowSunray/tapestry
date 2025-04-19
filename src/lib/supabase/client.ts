import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Missing Supabase environment variables. Using mock client.')
  } else {
    throw new Error('Missing Supabase environment variables')
  }
}

export const supabase = createBrowserClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
) 