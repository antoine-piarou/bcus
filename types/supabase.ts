export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      coaches: {
        Row: {
          id: string
          name: string
          photo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          photo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          photo_url?: string | null
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          date: string
          home_team_id: string | null
          away_team_id: string | null
          home_score: number | null
          away_score: number | null
          location: string | null
          division: string | null
          match_number: string | null
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          home_team_id?: string | null
          away_team_id?: string | null
          home_score?: number | null
          away_score?: number | null
          location?: string | null
          division?: string | null
          match_number?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          home_team_id?: string | null
          away_team_id?: string | null
          home_score?: number | null
          away_score?: number | null
          location?: string | null
          division?: string | null
          match_number?: string | null
          created_at?: string
        }
      }
      match_summaries: {
        Row: {
          id: string
          match_id: string | null
          coach_id: string | null
          summary: string | null
          visual_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          match_id?: string | null
          coach_id?: string | null
          summary?: string | null
          visual_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          match_id?: string | null
          coach_id?: string | null
          summary?: string | null
          visual_url?: string | null
          created_at?: string
        }
      }
      team_coaches: {
        Row: {
          team_id: string
          coach_id: string
        }
        Insert: {
          team_id: string
          coach_id: string
        }
        Update: {
          team_id?: string
          coach_id?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          category: string
          logo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          logo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          logo_url?: string | null
          created_at?: string
        }
      }
    }
  }
}

