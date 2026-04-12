import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth'

const reminderKeys = {
  all: ['reminders'] as const,
  movie: (tmdbId: number) => [...reminderKeys.all, tmdbId] as const,
}

export function useReminder(tmdbId: number) {
  const userId = useAuthStore((s) => s.user?.id)

  return useQuery({
    queryKey: reminderKeys.movie(tmdbId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId!)
        .eq('tmdb_id', tmdbId)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

export function useSetReminder() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async ({
      tmdbId,
      title,
      posterPath,
      remindAt,
    }: {
      tmdbId: number
      title: string
      posterPath: string | null
      remindAt: string
    }) => {
      const { error } = await supabase.from('reminders').upsert(
        {
          user_id: userId!,
          tmdb_id: tmdbId,
          title,
          poster_path: posterPath,
          remind_at: remindAt,
          notified: false,
        },
        { onConflict: 'user_id,tmdb_id' },
      )

      if (error) throw error
    },
    onSuccess: (_, { tmdbId }) => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.movie(tmdbId) })
      queryClient.invalidateQueries({ queryKey: reminderKeys.all })
    },
  })
}

export function useRemoveReminder() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async (tmdbId: number) => {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('user_id', userId!)
        .eq('tmdb_id', tmdbId)

      if (error) throw error
    },
    onSuccess: (_, tmdbId) => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.movie(tmdbId) })
      queryClient.invalidateQueries({ queryKey: reminderKeys.all })
    },
  })
}
