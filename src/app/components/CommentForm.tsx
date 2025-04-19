'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onCommentAdded: () => void;
}

export default function CommentForm({ postId, parentId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('comments')
        .insert([
          { 
            content, 
            post_id: postId,
            user_id: user.id,
            parent_id: parentId
          }
        ]);

      if (error) throw error;

      setContent('');
      onCommentAdded();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId ? "Write a reply..." : "Write a comment..."}
          className="flex-1 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-4 py-2 text-white bg-purple-500 rounded-full hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
} 