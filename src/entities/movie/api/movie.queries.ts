import { queryOptions } from '@tanstack/react-query'
import {
  getTrendingAll,
  getPopularMovies,
  getUpcomingMovies,
  discoverMovies,
  searchMulti,
  getMovieGenres,
  getMovieDetails,
  getMovieCredits,
  getMovieVideos,
  getMovieWatchProviders,
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
    return searchMulti(query.trim(), page)
  }

  if (tab === 'trending' && !hasActiveFilters(filters)) {
    return getTrendingAll(page)
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
  watchProviders: (movieId: number) => ['movies', 'watchProviders', movieId] as const,
  upcoming: (page: number) => ['movies', 'upcoming', page] as const,
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

  watchProviders: (movieId: number) =>
    queryOptions({
      queryKey: movieKeys.watchProviders(movieId),
      queryFn: () => getMovieWatchProviders(movieId),
      staleTime: 1000 * 60 * 60,
    }),

  upcoming: (page = 1) =>
    queryOptions({
      queryKey: movieKeys.upcoming(page),
      queryFn: () => getUpcomingMovies(page),
      staleTime: 1000 * 60 * 30,
    }),
}
