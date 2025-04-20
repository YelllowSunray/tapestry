export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          full_name: string | null
          avatar_url: string | null
          email: string | null
        }
        Insert: {
          id: string
          created_at?: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
        }
      }
      posts: {
        Row: {
          id: string
          created_at: string
          content: string
          user_id: string
          likes: number
          section: string | null
          category: string | null
          category_emoji: string | null
          category_part: string | null
          photo_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          content: string
          user_id: string
          likes?: number
          section?: string | null
          category?: string | null
          category_emoji?: string | null
          category_part?: string | null
          photo_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          content?: string
          user_id?: string
          likes?: number
          section?: string | null
          category?: string | null
          category_emoji?: string | null
          category_part?: string | null
          photo_url?: string | null
        }
      }
      comments: {
        Row: {
          id: string
          created_at: string
          content: string
          user_id: string
          post_id: string
          parent_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          content: string
          user_id: string
          post_id: string
          parent_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          content?: string
          user_id?: string
          post_id?: string
          parent_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 