'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AccountFormProps {
  user: User;
  profile: any; // Received profile data (can refine type later)
}

// Define a type for the profile data we expect/use
interface ProfileData {
  full_name: string | null;
  avatar_url: string | null;
}

export default function AccountForm({ user, profile }: AccountFormProps) {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize form fields with fetched profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      // Set other fields like avatar_url if needed
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const updates = {
        id: user.id,
        full_name: fullName.trim(),
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase.from('profiles').upsert(updates);

      if (updateError) {
        throw updateError;
      }
      
      setMessage('Profile updated successfully!');
      // Optionally refetch profile data on the parent page if needed

    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
      <form onSubmit={handleUpdateProfile} className="px-4 py-5 sm:p-6">
        <div className="space-y-6">
          {/* Email (Read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={user.email || ''}
              disabled // Email is usually not changeable directly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
            />
          </div>

          {/* Add other profile fields here (e.g., Avatar upload) */}

        </div>

        {/* Messages */}
        {message && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-md">
                <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
            </div>
        )}
        {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
        )}

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-display font-medium py-2 px-4 rounded-md shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 