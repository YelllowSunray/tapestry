import { createBrowserClient } from '@supabase/ssr'

// Only create a client if we're in the browser
const isBrowser = typeof window !== 'undefined'
let supabase = null

// Only attempt to create the client in the browser
if (isBrowser) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    try {
      supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
    } catch (error) {
      console.error('Error initializing Supabase client:', error)
    }
  } else {
    console.warn('Missing Supabase environment variables in browser')
  }
}

export { supabase } 