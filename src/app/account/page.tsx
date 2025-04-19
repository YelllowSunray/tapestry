'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [website, setWebsite] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);

        const { data: { session } } = await supabase?.auth.getSession() ?? { data: { session: null } };

        if (!session) {
          window.location.href = '/login';
          return;
        }

        const { data, error, status } = await supabase
          ?.from('profiles')
          .select(`username, website, avatar_url`)
          .eq('id', session.user.id)
          .single() ?? { data: null, error: null, status: 0 };

        if (error && status !== 406) {
          throw error;
        }

        if (data) {
          setUsername(data.username);
          setWebsite(data.website);
          setAvatarUrl(data.avatar_url);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }

    getProfile();

    // Optional: Listen for auth changes to redirect if logged out
    const { data: { subscription } } = supabase?.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!session) {
        // Redirect to login or handle appropriately
        window.location.href = '/login';
      }
    }) ?? { data: { subscription: null } };

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: string | null;
    website: string | null;
    avatar_url: string | null;
  }) {
    try {
      setLoading(true);

      const { data: { session } } = await supabase?.auth.getSession() ?? { data: { session: null } };

      if (!session) {
        throw new Error('No user session');
      }

      const updates = {
        id: session.user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase?.from('profiles').upsert(updates) ?? { error: null };

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Account Settings</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <form onSubmit={(e) => {
          e.preventDefault();
          updateProfile({ username, website, avatar_url: avatarUrl });
        }}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username || ''}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                id="website"
                type="url"
                value={website || ''}
                onChange={(e) => setWebsite(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {loading ? 'Loading...' : 'Update Profile'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
} 