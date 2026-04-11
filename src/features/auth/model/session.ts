import type { User, Session } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']

export interface AuthSession {
  user: User
  session: Session
  profile: Profile | null
}
