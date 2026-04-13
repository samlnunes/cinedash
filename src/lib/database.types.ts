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
          jellyseerr_request_id: number | null
          jellyseerr_media_status: number | null
          last_synced_at: string | null
          download_progress_pct: number | null
          download_eta: string | null
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
          jellyseerr_request_id?: number | null
          jellyseerr_media_status?: number | null
          last_synced_at?: string | null
          download_progress_pct?: number | null
          download_eta?: string | null
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
          jellyseerr_request_id?: number | null
          jellyseerr_media_status?: number | null
          last_synced_at?: string | null
          download_progress_pct?: number | null
          download_eta?: string | null
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
      posts: {
        Row: {
          id: string
          user_id: string
          tmdb_id: number
          media_type: string
          title: string
          poster_path: string | null
          rating: number | null
          body: string | null
          spoiler: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tmdb_id: number
          media_type?: string
          title: string
          poster_path?: string | null
          rating?: number | null
          body?: string | null
          spoiler?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tmdb_id?: number
          media_type?: string
          title?: string
          poster_path?: string | null
          rating?: number | null
          body?: string | null
          spoiler?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'posts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'post_likes_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'post_likes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      post_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          body: string
          parent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          body: string
          parent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          body?: string
          parent_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'post_comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'post_comments_user_id_fkey'
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
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
