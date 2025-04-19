'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';
import { createBrowserClient } from '@supabase/ssr';

type Profile = Database['public']['Tables']['profiles']['Row'];
type SupabaseClient = ReturnType<typeof createBrowserClient<Database>>;

export default function AccountForm({ user, profile }: { user: any; profile: Profile | null }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(profile?.full_name || '');
  const [avatar_url, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [email, setEmail] = useState(profile?.email || '');

  async function updateProfile({
    username,
    avatar_url,
    email,
  }: {
    username: string;
    avatar_url: string;
    email: string;
  }) {
    try {
      setLoading(true);

      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      const client = supabase as SupabaseClient;
      const updates = {
        id: user.id,
        full_name: username,
        avatar_url,
        email,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await client.from('profiles').upsert(updates);

      if (updateError) {
        throw updateError;
      }
    } catch (error) {
      alert('Error updating the data!');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-widget">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="username">Name</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="avatar_url">Avatar URL</label>
        <input
          id="avatar_url"
          type="text"
          value={avatar_url}
          onChange={(e) => setAvatarUrl(e.target.value)}
        />
      </div>

      <div>
        <button
          className="button primary block"
          onClick={() => updateProfile({ username, avatar_url, email })}
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>
    </div>
  );
} 