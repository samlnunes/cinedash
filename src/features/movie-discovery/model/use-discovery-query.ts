import { useInfiniteQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import {
  getTrendingAll,
  getPopularMovies,
  discoverMovies,
  searchMulti,
} from '@/entities/movie/api/movie.api'
import { useDiscoveryStore } from './discovery.store'

export function useDiscoveryQuery() {
  const { tab, query, filters } = useDiscoveryStore()
  const debouncedQuery = useDebouncedValue(query, 400)

  return useInfiniteQuery({
    queryKey: ['movies', 'discovery', tab, debouncedQuery, filters],
    queryFn: ({ pageParam = 1 }) => {
      if (debouncedQuery.trim()) {
        return searchMulti(debouncedQuery.trim(), pageParam)
      }

      if (tab === 'trending' && !filters.genreId) {
        return getTrendingAll(pageParam)
      }

      if (tab === 'popular' && !filters.genreId) {
        return getPopularMovies(pageParam)
      }

      return discoverMovies({
        page: pageParam,
        genreId: filters.genreId,
      })
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
  })
}
