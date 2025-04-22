'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

type SupabaseClient = ReturnType<typeof createBrowserClient<Database>>;

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initializeSession = async () => {
      try {
        if (!supabase) {
          throw new Error('Supabase client is not initialized');
        }

        const client = supabase as SupabaseClient;
        const { data: { session }, error: sessionError } = await client.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          router.push('/login');
          return;
        }

        setUser(session.user);
        await fetchProfile(session.user.id);
      } catch (error) {
        console.error('Error initializing session:', error);
        setError('Failed to initialize session. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, [router]);

  const fetchProfile = async (userId: string) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      const client = supabase as SupabaseClient;
      const { data, error: fetchError } = await client
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;
      setFullName(data?.full_name || '');
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      const client = supabase as SupabaseClient;
      const { error: updateError } = await client
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName.trim(),
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;
      setSuccess('Profile updated successfully!');
      
      // Refresh the page to update the navbar
      router.refresh();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Dashboard</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700"
                />
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Enter your full name"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This name will be displayed in the navbar and on your posts.
                </p>
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              {success && (
                <p className="text-green-500 text-sm">{success}</p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
} 