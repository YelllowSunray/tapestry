'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { logout } from '@/app/actions/auth';

export default function NavbarAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-8 w-8 animate-pulse bg-gray-200 rounded"></div>;
  }

  return (
    <div className="hidden md:flex items-center space-x-8">
      {user ? (
        // Logged In State
        <div className="flex items-center space-x-4">
          {/* Link to Account Page */}
          <Link href="/account" className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
             Account
          </Link>
          <span className="text-sm text-gray-700 dark:text-gray-300 border-l border-gray-300 dark:border-gray-600 pl-4">
            {user.email} 
          </span>
          {/* Logout Button using Server Action */}
          <form action={logout}>
            <button 
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-1.5 px-3 rounded-md transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      ) : (
        // Logged Out State
        <>
          <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-display">
            Login
          </Link>
          <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-4 rounded-md transition-colors text-sm font-display">
            Sign Up
          </Link>
        </>
      )}
    </div>
  );
} 