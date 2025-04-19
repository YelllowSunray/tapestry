'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function logout() {
  const supabase = await createClient();
  
  if (!supabase) {
    console.error('Supabase client is not available');
    redirect('/error');
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error logging out:', error);
    redirect('/error');
  }

  // Revalidate the root path to ensure UI updates correctly after logout
  revalidatePath('/', 'layout');
  
  // Redirect to the homepage after successful logout
  redirect('/');
} 