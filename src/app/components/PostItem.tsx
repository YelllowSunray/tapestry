'use client'; // Can be client or server, depending on needs

import { useState, useEffect } from 'react'; // Added useState and useEffect
import { Post } from '../types'; // Import the Post type from the types file
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns'; // For relative time
import { supabase } from '@/lib/supabase/client'; // Import supabase client
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import type { User } from '@supabase/supabase-js'; // Import User type
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

type SupabaseClient = ReturnType<typeof createBrowserClient<Database>>;

interface PostItemProps {
  post: Post;
  currentUser: User | null; // Pass the current user
  onPostDeleted: (postId: number) => void; // Callback after deletion
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  parent_id?: string | null;
  replies?: Comment[];
}

interface Profile {
  id: string;
  full_name: string;
}

export default function PostItem({ post, currentUser, onPostDeleted }: PostItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  // Format the timestamp into a readable relative format (e.g., "5 minutes ago")
  const timeAgo = post.created_at 
    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
    : 'just now';

  // TODO: Fetch author details (e.g., email or username) based on post.user_id if needed
  // This might involve another Supabase query here or joining tables in the initial fetch
  const authorIdentifier = post.full_name || post.author_email || `User (${post.user_id.substring(0, 6)})`; // Placeholder

  // Check if the current user is the author of the post
  const isAuthor = currentUser?.id === post.user_id;

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      const client = supabase as SupabaseClient;
      const { data: commentsData, error: commentsError } = await client
        .from('comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      const { data: profilesData, error: profilesError } = await client
        .from('profiles')
        .select('id, full_name');

      if (profilesError) throw profilesError;

      const profileMap = new Map(
        profilesData?.map((profile: Profile) => [profile.id, profile.full_name]) || []
      );

      // Process comments to build the reply hierarchy
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      // First pass: create comment objects and store in map
      commentsData?.forEach((comment: Comment) => {
        const commentWithReplies: Comment = {
          ...comment,
          replies: []
        };
        commentMap.set(comment.id, commentWithReplies);
      });

      // Second pass: build the hierarchy
      commentsData?.forEach((comment: Comment) => {
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(commentMap.get(comment.id)!);
          }
        } else {
          rootComments.push(commentMap.get(comment.id)!);
        }
      });

      setComments(rootComments);
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      setError(err.message || 'Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  // Fetch comment count when component mounts
  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        if (!supabase) {
          throw new Error('Supabase client is not initialized');
        }

        const client = supabase as SupabaseClient;
        const { count, error } = await client
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        if (error) throw error;
        setCommentCount(count || 0);
      } catch (err) {
        console.error('Error fetching comment count:', err);
      }
    };

    fetchCommentCount();
  }, [post.id]);

  // Update comment count when comments are loaded
  useEffect(() => {
    if (showComments) {
      setCommentCount(comments.length);
    }
  }, [comments, showComments]);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, post.id]);

  const handleDelete = async () => {
    if (!isAuthor) return; // Should not happen if button is hidden, but good practice

    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      const client = supabase as SupabaseClient;
      const { error: deleteError } = await client
        .from('posts')
        .delete()
        .eq('id', post.id) // Ensure we delete the correct post
        .eq('user_id', currentUser.id); // Double-check ownership server-side (belt-and-suspenders)

      if (deleteError) {
        throw deleteError;
      }
      
      // Call the callback passed from the parent to update the UI
      onPostDeleted(post.id);

    } catch (err: any) {
      console.error('Error deleting post:', err);
      setError(err.message || 'Failed to delete post.');
      setIsDeleting(false); // Allow retry if failed
    } 
    // No finally needed for setIsDeleting, as successful delete removes the component
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
              <Image
                src="/images/avatar-boy-svgrepo-com.svg"
                alt="User avatar"
                width={32}
                height={32}
                className="w-full h-full"
              />
            </div>
          </div>
          
          {/* Post Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {authorIdentifier}
                </span>
                {post.category && (
                  <span className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                    <span>{post.category_emoji}</span>
                    <span>{post.category}</span>
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {timeAgo}
              </span>
            </div>
            
            <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">
              {post.content}
            </p>
            
            {/* Comments Section */}
            <div className="mt-3">
              <button
                onClick={() => setShowComments(!showComments)}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
              >
                {showComments ? 'Hide' : `Comments (${commentCount})`}
              </button>

              {showComments && (
                <div className="mt-3 space-y-3">
                  {loadingComments ? (
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Loading...</div>
                  ) : (
                    <>
                      {comments.map((comment) => (
                        <CommentItem 
                          key={comment.id} 
                          comment={comment} 
                          postId={post.id.toString()}
                          onCommentAdded={fetchComments}
                        />
                      ))}
                      {currentUser && (
                        <CommentForm postId={post.id.toString()} onCommentAdded={fetchComments} />
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Delete Button */}
          {isAuthor && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label="Delete post"
            >
              {isDeleting ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 