'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function logout() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error logging out:', error);
    // Optionally redirect to an error page or handle differently
    redirect('/error'); // Redirect to a generic error page
  }

  // Revalidate the root path to ensure UI updates correctly after logout
  revalidatePath('/', 'layout'); 
  // Redirect to the homepage after successful logout
  redirect('/');
} 