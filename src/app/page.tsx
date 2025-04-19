'use client'; // Need client component for hooks and auth state

import { useState, useEffect, useCallback } from 'react';
// import Link from 'next/link'; // No longer needed here
import { supabase } from '@/lib/supabase/client';
import type { Session, PostgrestError, User, AuthChangeEvent } from '@supabase/supabase-js';
import StatusForm from './components/StatusForm';
import PostItem from './components/PostItem'; // Import the PostItem component (we'll create this next)
import { Post } from './types';

interface Profile {
  id: string;
  full_name: string;
}

interface SupabaseResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ full_name: string } | null>(null);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase?.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
    }) ?? { data: { subscription: null } };

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session?.user) {
      // Fetch user profile
      supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching profile:', error);
          } else {
            setUserProfile(data);
          }
        });
    }
  }, [session]);

  // Removed session state, tracking user directly
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [errorPosts, setErrorPosts] = useState<string | null>(null);

  // Fetch posts function
  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    setErrorPosts(null);
    try {
      // First fetch all posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('id, content, created_at, user_id, category, category_emoji, category_part')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      
      console.log('Raw posts data from Supabase:', postsData);

      // Then fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (profilesError) throw profilesError;

      // Create a map of user_id to full_name for quick lookup
      const profileMap = new Map(
        profilesData?.map((profile: Profile) => [profile.id, profile.full_name]) || []
      );

      // Process posts to include full_name
      const processedData = postsData?.map((post: Post) => ({
        ...post,
        full_name: profileMap.get(post.user_id) || null
      })) || [];

      console.log('Processed posts data:', processedData);
      setPosts(processedData as Post[]);
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setErrorPosts(err.message || 'Failed to fetch posts.');
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  // Callback to remove post from local state after deletion
  const handlePostDeleted = (deletedPostId: number) => {
    setPosts(currentPosts => currentPosts.filter(post => post.id !== deletedPostId));
  };

  // Fetch initial user session and posts
  useEffect(() => {
    setLoadingSession(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoadingSession(false);
      if (currentUser) {
        fetchPosts(); // Fetch posts only if logged in initially
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoadingSession(false);
      if (currentUser) {
        fetchPosts(); // Re-fetch posts if auth state changes to logged in
      } else {
        setPosts([]); // Clear posts if logged out
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchPosts]); // Add fetchPosts to dependency array

  // Logout is now handled by the Navbar server action
  // const handleLogout = async () => { ... };

  // Show main loading indicator only for session check
  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p>Loading session...</p> 
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 pt-24 pb-8">
        {session ? (
          <div className="space-y-8">
            {/* Status Form */}
            {user && <StatusForm onPostAdded={fetchPosts} />}
            
            {/* Posts Section */}
            <div className="max-w-2xl mx-auto">
              {loadingPosts && (
                <p className="text-center text-purple-600 dark:text-purple-300 font-medium">Loading posts...</p>
              )}
              {errorPosts && (
                <p className="text-center text-red-500 font-medium">Error: {errorPosts}</p>
              )}
              {!loadingPosts && posts.length === 0 && user && (
                <p className="text-center text-pink-600 dark:text-pink-300 font-medium">No posts yet. Be the first!</p>
              )}
              {!user && (
                <p className="text-center text-sky-500 dark:text-sky-300 font-medium">Login to see and create posts.</p>
              )}
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostItem 
                    key={post.id} 
                    post={post} 
                    currentUser={user}
                    onPostDeleted={handlePostDeleted}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <p>Login to see and create posts.</p> 
          </div>
        )}
      </div>
    </main>
  );
}
