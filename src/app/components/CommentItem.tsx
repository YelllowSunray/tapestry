'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import CommentForm from './CommentForm';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  full_name?: string | null;
  replies?: Comment[];
  parent_id?: string | null;
}

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onCommentAdded: () => void;
}

export default function CommentItem({ comment, postId, onCommentAdded }: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', comment.id);

      if (error) throw error;
      onCommentAdded();
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <div className="bg-gray-100 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.full_name}</span>
              <span className="text-xs text-gray-500">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-1 text-sm">{comment.content}</p>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-purple-500 hover:text-purple-600"
            >
              Reply
            </button>
            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-gray-500 hover:text-gray-600"
              >
                {showReplies ? 'Hide replies' : `Show ${comment.replies.length} replies`}
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-600 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {showReplyForm && (
        <div className="ml-8 mt-2">
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onCommentAdded={() => {
              setShowReplyForm(false);
              onCommentAdded();
            }}
          />
        </div>
      )}

      {showReplies && comment.replies && (
        <div className="ml-8 mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onCommentAdded={onCommentAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
} 