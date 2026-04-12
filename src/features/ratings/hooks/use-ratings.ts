import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth'

const ratingKeys = {
  all: ['ratings'] as const,
  movie: (tmdbId: number) => [...ratingKeys.all, tmdbId] as const,
}

export function useMyRating(tmdbId: number) {
  const userId = useAuthStore((s) => s.user?.id)

  return useQuery({
    queryKey: ratingKeys.movie(tmdbId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ratings')
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

export function useSetRating() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async ({ tmdbId, rating }: { tmdbId: number; rating: number }) => {
      const { error } = await supabase
        .from('ratings')
        .upsert(
          { user_id: userId!, tmdb_id: tmdbId, rating, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,tmdb_id' },
        )

      if (error) throw error
    },
    onSuccess: (_, { tmdbId }) => {
      queryClient.invalidateQueries({ queryKey: ratingKeys.movie(tmdbId) })
    },
  })
}

export function useRemoveRating() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async (tmdbId: number) => {
      const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('user_id', userId!)
        .eq('tmdb_id', tmdbId)

      if (error) throw error
    },
    onSuccess: (_, tmdbId) => {
      queryClient.invalidateQueries({ queryKey: ratingKeys.movie(tmdbId) })
    },
  })
}
