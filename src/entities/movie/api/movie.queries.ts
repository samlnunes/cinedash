import { queryOptions } from '@tanstack/react-query'
import {
  getTrendingMovies,
  getPopularMovies,
  discoverMovies,
  searchMovies,
  getMovieGenres,
  getMovieDetails,
  getMovieCredits,
  getMovieVideos,
} from './movie.api'

interface DiscoveryParams {
  tab: 'trending' | 'popular'
  page: number
  query: string
  filters: { genreId?: number; year?: number; minRating?: number }
}

function hasActiveFilters(filters: DiscoveryParams['filters']) {
  return (
    filters.genreId !== undefined ||
    filters.year !== undefined ||
    filters.minRating !== undefined
  )
}

function discoveryQueryFn(params: DiscoveryParams) {
  const { tab, page, query, filters } = params

  if (query.trim()) {
    return searchMovies(query.trim(), page)
  }

  if (tab === 'trending' && !hasActiveFilters(filters)) {
    return getTrendingMovies(page)
  }

  if (tab === 'popular' && !hasActiveFilters(filters)) {
    return getPopularMovies(page)
  }

  return discoverMovies({
    page,
    genreId: filters.genreId,
    year: filters.year,
    minRating: filters.minRating,
  })
}

export const movieKeys = {
  all: ['movies'] as const,
  genres: () => ['movies', 'genres'] as const,
  discovery: (params: DiscoveryParams) =>
    ['movies', 'discovery', params] as const,
  detail: (movieId: number) => ['movies', 'detail', movieId] as const,
  credits: (movieId: number) => ['movies', 'credits', movieId] as const,
  videos: (movieId: number) => ['movies', 'videos', movieId] as const,
}

export const movieQueries = {
  genres: () =>
    queryOptions({
      queryKey: movieKeys.genres(),
      queryFn: getMovieGenres,
      staleTime: 1000 * 60 * 60,
    }),

  discovery: (params: DiscoveryParams) =>
    queryOptions({
      queryKey: movieKeys.discovery(params),
      queryFn: () => discoveryQueryFn(params),
    }),

  detail: (movieId: number) =>
    queryOptions({
      queryKey: movieKeys.detail(movieId),
      queryFn: () => getMovieDetails(movieId),
      staleTime: 1000 * 60 * 10,
    }),

  credits: (movieId: number) =>
    queryOptions({
      queryKey: movieKeys.credits(movieId),
      queryFn: () => getMovieCredits(movieId),
      staleTime: 1000 * 60 * 30,
    }),

  videos: (movieId: number) =>
    queryOptions({
      queryKey: movieKeys.videos(movieId),
      queryFn: () => getMovieVideos(movieId),
      staleTime: 1000 * 60 * 30,
    }),
}
