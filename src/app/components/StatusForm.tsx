'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface StatusFormProps {
  onPostAdded?: () => void;
}

type Category = {
  emoji: string;
  name: string;
  description: string;
  part: string;
};

const categories: Category[] = [
  { emoji: '🎈', name: 'Joy', description: 'A fun or lighthearted moment', part: 'Leaves' },
  { emoji: '📚', name: 'Progress', description: 'A milestone or learning moment', part: 'Stem' },
  { emoji: '✨', name: 'Insight', description: 'A realization or meaningful thought', part: 'Flower' },
  { emoji: '🧠', name: 'Inner Work', description: 'A shadow / healing / vulnerable entry', part: 'Roots' },
  { emoji: '🧺', name: 'Share', description: 'A creation or offering', part: '' }
];

export default function StatusForm({ onPostAdded }: StatusFormProps) {
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !selectedCategory) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to post');

      let photoUrl = null;
      if (photo) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(fileName);
        photoUrl = publicUrl;
      }

      const { error: insertError } = await supabase
        .from('posts')
        .insert([
          {
            content: content.trim(),
            user_id: user.id,
            category: selectedCategory.name,
            category_emoji: selectedCategory.emoji,
            category_part: selectedCategory.part,
            photo_url: photoUrl
          }
        ]);

      if (insertError) throw insertError;

      setContent('');
      setSelectedCategory(null);
      setPhoto(null);
      setPhotoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      router.refresh();
      onPostAdded?.();
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.name}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                selectedCategory?.name === category.name
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-lg">{category.emoji}</span>
              <span className="font-medium">{category.name}</span>
            </button>
          ))}
        </div>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              ref={fileInputRef}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's a moment worth remembering today?"
              className="w-full p-4 text-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isSubmitting}
            />
            {photoPreview && (
              <div className="mt-2 relative">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="max-h-48 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    setPhotoPreview(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="absolute top-2 right-2 p-1 bg-gray-800 bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || (!content.trim() && !selectedCategory && !photo)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
} 