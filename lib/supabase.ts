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
          is_verified: boolean | null
          verification_date: string | null
          verification_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          is_verified?: boolean | null
          verification_date?: string | null
          verification_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          is_verified?: boolean | null
          verification_date?: string | null
          verification_reason?: string | null
          updated_at?: string
        }
      }
      review_votes: {
        Row: {
          id: string
          review_id: string
          user_id: string
          is_helpful: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          review_id: string
          user_id: string
          is_helpful: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          is_helpful?: boolean
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reported_content_type: string
          reported_content_id: string
          reporter_user_id: string
          reported_user_id: string | null
          reason: string
          description: string | null
          status: string
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reported_content_type: string
          reported_content_id: string
          reporter_user_id: string
          reported_user_id?: string | null
          reason: string
          description?: string | null
          status?: string
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: string
          admin_notes?: string | null
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
      reviews_with_votes: {
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
          username: string | null
          full_name: string | null
          avatar_url: string | null
          is_verified: boolean | null
          helpful_count: number
          not_helpful_count: number
          helpfulness_score: number
        }
      }
    }
  }
}

export type Place = Database["public"]["Tables"]["places"]["Row"]
export type Review = Database["public"]["Tables"]["reviews"]["Row"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type ReviewVote = Database["public"]["Tables"]["review_votes"]["Row"]
export type Report = Database["public"]["Tables"]["reports"]["Row"]
export type PlaceRating = Database["public"]["Views"]["place_ratings"]["Row"]
export type ReviewWithVotes = Database["public"]["Views"]["reviews_with_votes"]["Row"]

// Extended types for UI components
export interface ExtendedReview extends Review {
  profiles?: Profile | null
  helpful_count?: number
  not_helpful_count?: number
  helpfulness_score?: number
  user_vote?: boolean | null
}

export type ReportReason = 
  | 'inappropriate_content'
  | 'spam'
  | 'harassment'
  | 'false_information'
  | 'hate_speech'
  | 'other'

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'

export type ContentType = 'review' | 'profile' | 'place'
