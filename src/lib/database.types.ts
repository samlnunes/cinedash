export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          role: 'user' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          display_name: string
          avatar_url?: string | null
          role?: 'user' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_url?: string | null
          role?: 'user' | 'admin'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      watchlist: {
        Row: {
          id: string
          user_id: string
          tmdb_id: number
          media_type: 'movie' | 'tv'
          title: string
          poster_path: string | null
          year: string | null
          vote_average: number | null
          added_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tmdb_id: number
          media_type?: 'movie' | 'tv'
          title: string
          poster_path?: string | null
          year?: string | null
          vote_average?: number | null
          added_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tmdb_id?: number
          media_type?: 'movie' | 'tv'
          title?: string
          poster_path?: string | null
          year?: string | null
          vote_average?: number | null
          added_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'watchlist_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      requests: {
        Row: {
          id: string
          user_id: string
          tmdb_id: number
          media_type: string
          title: string
          poster_path: string | null
          year: string | null
          vote_average: number | null
          note: string | null
          status: 'pending' | 'approved' | 'downloading' | 'done' | 'rejected'
          admin_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tmdb_id: number
          media_type?: string
          title: string
          poster_path?: string | null
          year?: string | null
          vote_average?: number | null
          note?: string | null
          status?: 'pending' | 'approved' | 'downloading' | 'done' | 'rejected'
          admin_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tmdb_id?: number
          media_type?: string
          title?: string
          poster_path?: string | null
          year?: string | null
          vote_average?: number | null
          note?: string | null
          status?: 'pending' | 'approved' | 'downloading' | 'done' | 'rejected'
          admin_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'requests_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
