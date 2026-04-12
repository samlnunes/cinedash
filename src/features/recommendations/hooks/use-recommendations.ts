import { useQuery } from '@tanstack/react-query'
import { getMovieRecommendations } from '@/entities/movie/api/movie.api'
import { useWatchlist } from '@/features/watchlist'
import type { Movie } from '@/entities/movie'

export function useRecommendations() {
  const { data: watchlist } = useWatchlist()

  // Pick up to 3 recent watchlist items as seeds
  const seeds = watchlist?.slice(0, 3) ?? []
  const seedIds = seeds.map((s) => s.tmdb_id)

  return useQuery({
    queryKey: ['recommendations', ...seedIds],
    queryFn: async () => {
      const results = await Promise.all(
        seedIds.map((id) => getMovieRecommendations(id)),
      )

      // Flatten, deduplicate, exclude movies already in watchlist
      const watchlistIds = new Set(watchlist?.map((w) => w.tmdb_id) ?? [])
      const seen = new Set<number>()
      const movies: Array<Movie & { basedOn: string }> = []

      for (let i = 0; i < results.length; i++) {
        const seed = seeds[i]
        for (const movie of results[i].results) {
          if (!seen.has(movie.id) && !watchlistIds.has(movie.id)) {
            seen.add(movie.id)
            movies.push({ ...movie, basedOn: seed.title })
          }
        }
      }

      return movies.slice(0, 20)
    },
    enabled: seedIds.length > 0,
    staleTime: 1000 * 60 * 15,
  })
}
