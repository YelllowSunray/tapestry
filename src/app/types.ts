export interface Post {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  author_email?: string;
  full_name?: string | null;
  category?: string | null;
  category_emoji?: string | null;
  category_part?: string | null;
  subcategory?: string;
  subcategory_emoji?: string;
  photo_url?: string | null;
  metadata?: {
    section?: string;
    [key: string]: any;
  };
  likes?: number;
} 