'use client'; // Need client component for hooks and auth state

import { useState, useEffect, useCallback } from 'react';
// import Link from 'next/link'; // No longer needed here
import { supabase } from '@/lib/supabase/client';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import type { Session, PostgrestError, User, AuthChangeEvent } from '@supabase/supabase-js';
import StatusForm from './components/StatusForm';
import PostItem from './components/PostItem'; // Import the PostItem component (we'll create this next)
import { Post } from './types';

type SupabaseClient = ReturnType<typeof createBrowserClient<Database>>;

interface Profile {
  id: string;
  full_name: string;
}

interface SupabaseResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ full_name: string } | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [errorPosts, setErrorPosts] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const initializeSession = async () => {
      try {
        if (!supabase) {
          throw new Error('Supabase client is not initialized');
        }

        const client = supabase as SupabaseClient;
        
        // First try to get the session
        const { data: { session }, error: sessionError } = await client.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }
        
        setSession(session);
        setLoading(false);

        // Then set up the auth state change listener
        const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
          console.log('Auth state changed:', event, session);
          setSession(session);
          setLoading(false);
        });

        return () => {
          subscription?.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing session:', error);
        setError('Failed to initialize session. Please check your connection and try again.');
        setLoading(false);
      }
    };

    initializeSession();
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !supabase || !session?.user) return;

    const fetchProfile = async () => {
      try {
        const client = supabase as SupabaseClient;
        const { data, error } = await client
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [session, isClient]);

  const fetchPosts = useCallback(async () => {
    if (!isClient || !supabase) return;

    setLoadingPosts(true);
    setErrorPosts(null);
    try {
      const client = supabase as SupabaseClient;
      const { data: postsData, error: postsError } = await client
        .from('posts')
        .select('id, content, created_at, user_id, category, category_emoji, category_part')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      
      const { data: profilesData, error: profilesError } = await client
        .from('profiles')
        .select('id, full_name');

      if (profilesError) throw profilesError;

      const profileMap = new Map(
        profilesData?.map((profile: Profile) => [profile.id, profile.full_name]) || []
      );

      const processedData = postsData?.map((post: Post) => ({
        ...post,
        full_name: profileMap.get(post.user_id) || null
      })) || [];

      setPosts(processedData as Post[]);
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setErrorPosts(err.message || 'Failed to fetch posts.');
    } finally {
      setLoadingPosts(false);
    }
  }, [isClient]);

  useEffect(() => {
    if (session?.user) {
      fetchPosts();
    }
  }, [session, fetchPosts]);

  if (!isClient) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Loading session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 pt-24 pb-8">
        {session ? (
          <div className="space-y-8">
            {/* Status Form */}
            {session.user && <StatusForm onPostAdded={fetchPosts} />}
            
            {/* Posts Section */}
            <div className="max-w-2xl mx-auto">
              {loadingPosts && (
                <p className="text-center text-purple-600 dark:text-purple-300 font-medium">Loading posts...</p>
              )}
              {errorPosts && (
                <p className="text-center text-red-500 font-medium">Error: {errorPosts}</p>
              )}
              {!loadingPosts && posts.length === 0 && session.user && (
                <p className="text-center text-pink-600 dark:text-pink-300 font-medium">No posts yet. Be the first!</p>
              )}
              {!session.user && (
                <p className="text-center text-sky-500 dark:text-sky-300 font-medium">Login to see and create posts.</p>
              )}
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostItem 
                    key={post.id} 
                    post={post} 
                    currentUser={session.user}
                    onPostDeleted={fetchPosts}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-400">Login to see and create posts.</p>
          </div>
        )}
      </div>
    </main>
  );
}
