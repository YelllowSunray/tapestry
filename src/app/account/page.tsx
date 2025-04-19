'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import AccountForm from '../components/AccountForm'; // We will create this next

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null); // Use 'any' for now, define a Profile type later
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch profile data if user exists
        try {
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select(`full_name, avatar_url`)
            .eq('id', user.id)
            .single(); // Expecting only one row

          if (profileError && profileError.code !== 'PGRST116') { // Ignore error if profile doesn't exist yet
            throw profileError;
          }
          setProfile(data);
        } catch (err: any) {
          console.error('Error fetching profile:', err);
          setError(err.message || 'Failed to load profile data.');
        }
      } else {
        setError('You must be logged in to view this page.');
      }
      setLoading(false);
    };

    fetchUserData();

    // Optional: Listen for auth changes to redirect if logged out
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        // Redirect to login or handle appropriately
        window.location.href = '/login'; 
      } else {
        // Refetch if user changes (less likely here)
        if (session.user?.id !== user?.id) {
           fetchUserData();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [user?.id]); // Re-run if user id changes

  if (loading) {
    return <div className="p-8">Loading account information...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  if (!user) {
     // Should be handled by redirect, but as a fallback
     return <div className="p-8">Please log in.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Account Settings</h1>
      {/* Pass user and profile data to the form */}
      <AccountForm user={user} profile={profile} />
    </div>
  );
} 