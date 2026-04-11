import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from './session'
import { setCurrentUserId } from '@/shared/lib/storage/current-user'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean

  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  fetchProfile: (userId: string) => Promise<void>

  signInWithGoogle: () => Promise<{ error?: string }>
  logout: () => Promise<void>
  isAuthenticated: () => boolean
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,

  setSession: (session) => {
    const user = session?.user ?? null
    set({ session, user, loading: false })
    setCurrentUserId(user?.id ?? null)

    if (user) {
      get().fetchProfile(user.id)
    } else {
      set({ profile: null })
    }
  },

  setProfile: (profile) => set({ profile }),

  fetchProfile: async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      set({ profile: data })
    }
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    })

    if (error) {
      return { error: error.message }
    }
    return {}
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, profile: null })
    setCurrentUserId(null)
  },

  isAuthenticated: () => get().session !== null,

  isAdmin: () => get().profile?.role === 'admin',
}))

/**
 * Initialize auth state from Supabase.
 * Call once at app startup, before mounting the router.
 * Returns an unsubscribe function.
 */
export async function initializeAuth(): Promise<() => void> {
  const { data: { session } } = await supabase.auth.getSession()
  useAuthStore.getState().setSession(session)

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      useAuthStore.getState().setSession(session)
    },
  )

  return () => subscription.unsubscribe()
}
