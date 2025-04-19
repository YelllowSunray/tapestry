export interface Post {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  author_email?: string;
  full_name?: string | null;
  category?: string;
  category_emoji?: string;
  category_part?: string;
} 