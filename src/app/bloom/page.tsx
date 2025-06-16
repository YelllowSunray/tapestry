'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import type { Session, PostgrestError, User } from '@supabase/supabase-js';
import BloomStatusForm from '../components/BloomStatusForm';
import PostItem from '../components/PostItem';
import { Post } from '../types';

type SupabaseClient = ReturnType<typeof createBrowserClient<Database>>;

interface Profile {
  id: string;
  full_name: string;
}

export default function BloomPage() {
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
      } catch (error) {
        console.error('Error initializing session:', error);
        setError('Failed to initialize session. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, [isClient]);

  const fetchPosts = useCallback(async () => {
    if (!isClient) {
      console.error('Client not initialized');
      return;
    }

    if (!supabase) {
      console.error('Supabase client is not initialized');
      setErrorPosts('Database connection not available. Please refresh the page.');
      return;
    }

    setLoadingPosts(true);
    setErrorPosts(null);

    try {
      console.log('Starting to fetch posts...');
      const client = supabase as SupabaseClient;

      // First, fetch all posts with their user IDs
      const { data: postsData, error: postsError } = await client
        .from('posts')
        .select('id, content, created_at, user_id, category, category_emoji, category_part, photo_url, metadata')
        .eq('section', 'bloom')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        throw new Error(`Failed to fetch posts: ${postsError.message}`);
      }

      if (!postsData || postsData.length === 0) {
        console.log('No posts found');
        setPosts([]);
        return;
      }

      // Log the posts we fetched
      console.log('Posts fetched:', postsData.map(p => ({ id: p.id, user_id: p.user_id })));

      // Get unique user IDs from posts
      const userIds = [...new Set(postsData.map(post => post.user_id))];
      console.log('Unique user IDs:', userIds);

      // Fetch profiles for all users who have posts
      const { data: profilesData, error: profilesError } = await client
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
      }

      if (!profilesData) {
        console.error('No profiles found for users:', userIds);
        throw new Error('Failed to fetch user profiles');
      }

      // Log the profiles we fetched
      console.log('Profiles fetched:', profilesData);

      // Create a map of user IDs to profile data
      const profileMap = new Map();
      profilesData.forEach(profile => {
        if (profile.id && profile.full_name) {
          console.log(`Mapping profile: ${profile.id} -> ${profile.full_name}`);
          profileMap.set(profile.id, profile.full_name);
        } else {
          console.warn(`Profile missing data:`, profile);
        }
      });

      // Log the profile map
      console.log('Profile map entries:', Array.from(profileMap.entries()));

      // Combine posts with profile data
      const processedData = postsData.map(post => {
        const fullName = profileMap.get(post.user_id);
        console.log(`Processing post ${post.id}:`, {
          user_id: post.user_id,
          found_name: fullName,
          has_profile: profileMap.has(post.user_id)
        });
        
        return {
          ...post,
          full_name: fullName || null
        };
      });

      // Log the final processed data
      console.log('Processed posts:', processedData.map(p => ({
        id: p.id,
        user_id: p.user_id,
        full_name: p.full_name
      })));

      setPosts(processedData as Post[]);
      setErrorPosts(null);
    } catch (error: any) {
      console.error('Detailed error in fetchPosts:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack
      });
      setErrorPosts(error.message || 'Failed to fetch posts. Please try again later.');
    } finally {
      setLoadingPosts(false);
    }
  }, [isClient]);

  // Add a retry mechanism
  const handleRetry = useCallback(() => {
    console.log('Retrying fetch...');
    setErrorPosts(null);
    fetchPosts();
  }, [fetchPosts]);

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

  if (errorPosts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-4">{errorPosts}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
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
            <div className="max-w-2xl mx-auto">
              <h1 className="text-xl text-center text-blue-600 dark:text-blue-400 mb-8">
                Capture awe, inspiration, and transcendent experiences — moments that lift you.
              </h1>
            </div>
            {session.user && <BloomStatusForm onPostAdded={fetchPosts} />}
            
            <div className="max-w-2xl mx-auto">
              {loadingPosts && (
                <p className="text-center text-purple-600 dark:text-purple-300 font-medium">Loading posts...</p>
              )}
              {errorPosts && (
                <p className="text-center text-red-500 font-medium">Error: {errorPosts}</p>
              )}
              {!loadingPosts && posts.length === 0 && session.user && (
                <p className="text-center text-pink-600 dark:text-pink-300 font-medium">No posts yet. Be the first to share your spiritual journey!</p>
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