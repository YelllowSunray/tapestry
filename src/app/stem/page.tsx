'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import type { Session, PostgrestError, User } from '@supabase/supabase-js';
import StemStatusForm from '../components/StemStatusForm';
import PostItem from '../components/PostItem';
import { Post } from '../types';

type SupabaseClient = ReturnType<typeof createBrowserClient<Database>>;

interface Profile {
  id: string;
  full_name: string;
}

export default function StemPage() {
  const [isClient, setIsClient] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        const { data: { session }, error: sessionError } = await client.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        setSession(session);
        setLoading(false);
      } catch (error) {
        console.error('Error initializing session:', error);
        setError('Failed to initialize session. Please check your connection and try again.');
        setLoading(false);
      }
    };

    initializeSession();
  }, [isClient]);

  const fetchPosts = useCallback(async () => {
    if (!isClient || !supabase) return;

    setLoadingPosts(true);
    setErrorPosts(null);
    try {
      const client = supabase as SupabaseClient;
      const { data: postsData, error: postsError } = await client
        .from('posts')
        .select('id, content, created_at, user_id, category, category_emoji, category_part, subcategory, subcategory_emoji, photo_url')
        .eq('section', 'stem')
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 pt-24 pb-8">
        {session ? (
          <div className="space-y-8">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-xl text-center text-green-600 dark:text-green-400 mb-8">
                How do you evolve?
              </h1>
            </div>
            {session.user && <StemStatusForm onPostAdded={fetchPosts} />}
            
            <div className="max-w-2xl mx-auto">
              {loadingPosts && (
                <p className="text-center text-green-600 dark:text-green-300 font-medium">Loading posts...</p>
              )}
              {errorPosts && (
                <p className="text-center text-red-500 font-medium">Error: {errorPosts}</p>
              )}
              {!loadingPosts && posts.length === 0 && session.user && (
                <p className="text-center text-emerald-600 dark:text-emerald-300 font-medium">No posts yet. Start documenting your growth journey!</p>
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