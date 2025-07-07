import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://hmkjgwbazdpsppgtxjuc.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhta2pnd2JhemRwc3BwZ3R4anVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NTQxOTIsImV4cCI6MjA2NjMzMDE5Mn0.p0gNZYEF5RKP9DcAAfN1oqmPOOCu8elz2GxN1-6KirQ"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      places: {
        Row: {
          id: string
          name: string
          address: string | null
          categories: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          categories?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          categories?: string[] | null
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          place_id: string
          user_id: string
          wheelchair_access: number
          entrance_access: number
          bathroom_access: number
          table_height: number
          staff_helpfulness: number
          comments: string | null
          images: string[] | null
          is_anonymous: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          place_id: string
          user_id: string
          wheelchair_access: number
          entrance_access: number
          bathroom_access: number
          table_height: number
          staff_helpfulness: number
          comments?: string | null
          images?: string[] | null
          is_anonymous?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          place_id?: string
          user_id?: string
          wheelchair_access?: number
          entrance_access?: number
          bathroom_access?: number
          table_height?: number
          staff_helpfulness?: number
          comments?: string | null
          images?: string[] | null
          is_anonymous?: boolean
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      place_ratings: {
        Row: {
          id: string
          name: string
          address: string | null
          categories: string[] | null
          created_at: string
          review_count: number
          avg_wheelchair_access: number | null
          avg_entrance_access: number | null
          avg_bathroom_access: number | null
          avg_table_height: number | null
          avg_staff_helpfulness: number | null
          avg_overall_rating: number | null
        }
      }
    }
  }
}

export type Place = Database["public"]["Tables"]["places"]["Row"]
export type Review = Database["public"]["Tables"]["reviews"]["Row"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type PlaceRating = Database["public"]["Views"]["place_ratings"]["Row"]
