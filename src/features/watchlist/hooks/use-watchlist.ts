import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth'
import type { Movie } from '@/entities/movie'

export const watchlistKeys = {
  all: ['watchlist'] as const,
  mine: () => [...watchlistKeys.all, 'mine'] as const,
}

export function useWatchlist() {
  const userId = useAuthStore((s) => s.user?.id)

  return useQuery({
    queryKey: watchlistKeys.mine(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', userId!)
        .order('added_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

export function useIsInWatchlist(tmdbId: number) {
  const { data: items } = useWatchlist()
  return items?.some((item) => item.tmdb_id === tmdbId) ?? false
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async (movie: Movie & { media_type?: string; name?: string; first_air_date?: string }) => {
      const isTv = movie.media_type === 'tv'
      const title = isTv ? (movie.name ?? movie.title) : movie.title
      const date = isTv ? (movie.first_air_date ?? movie.release_date) : movie.release_date

      const { error } = await supabase.from('watchlist').upsert(
        {
          user_id: userId!,
          tmdb_id: movie.id,
          media_type: isTv ? 'tv' : 'movie',
          title,
          poster_path: movie.poster_path,
          year: date?.slice(0, 4) ?? null,
          vote_average: movie.vote_average,
        },
        { onConflict: 'user_id,tmdb_id,media_type' },
      )

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.all })
    },
  })
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async (tmdbId: number) => {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', userId!)
        .eq('tmdb_id', tmdbId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.all })
    },
  })
}

export function useToggleWatchlist() {
  const { data: items } = useWatchlist()
  const add = useAddToWatchlist()
  const remove = useRemoveFromWatchlist()

  return {
    toggle: (movie: Movie) => {
      const inList = items?.some((item) => item.tmdb_id === movie.id) ?? false
      if (inList) {
        remove.mutate(movie.id)
      } else {
        add.mutate(movie)
      }
    },
    isPending: add.isPending || remove.isPending,
  }
}
