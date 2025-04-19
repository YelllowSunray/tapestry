'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import Link from 'next/link';

export default function NavbarAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase?.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase?.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
    }) ?? { data: { subscription: null } };

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase?.auth.signOut() ?? { error: null };
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />;
  }

  return user ? (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {user.email}
      </span>
      <button
        onClick={handleSignOut}
        className="rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Sign Out
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-4">
      <Link
        href="/login"
        className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Sign In
      </Link>
      <Link
        href="/signup"
        className="rounded-md border border-indigo-600 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Sign Up
      </Link>
    </div>
  );
} 