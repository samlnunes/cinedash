export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          role: 'user' | 'admin'
          jellyfin_username: string | null
          share_token: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name: string
          avatar_url?: string | null
          role?: 'user' | 'admin'
          jellyfin_username?: string | null
          share_token?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_url?: string | null
          role?: 'user' | 'admin'
          jellyfin_username?: string | null
          share_token?: string | null
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
      reminders: {
        Row: {
          id: string
          user_id: string
          tmdb_id: number
          title: string
          poster_path: string | null
          remind_at: string
          notified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tmdb_id: number
          title: string
          poster_path?: string | null
          remind_at: string
          notified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tmdb_id?: number
          title?: string
          poster_path?: string | null
          remind_at?: string
          notified?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reminders_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      ratings: {
        Row: {
          id: string
          user_id: string
          tmdb_id: number
          rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tmdb_id: number
          rating: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tmdb_id?: number
          rating?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ratings_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string | null
          link: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          body?: string | null
          link?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          body?: string | null
          link?: string | null
          read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      request_votes: {
        Row: {
          id: string
          request_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'request_votes_request_id_fkey'
            columns: ['request_id']
            isOneToOne: false
            referencedRelation: 'requests'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'request_votes_user_id_fkey'
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
