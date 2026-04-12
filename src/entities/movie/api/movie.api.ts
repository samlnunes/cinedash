import { tmdbFetch } from '@/shared/api/tmdb/client'
import type {
  Genre,
  Movie,
  MovieCreditsResponse,
  MovieDetails,
  MovieVideosResponse,
  PaginatedResponse,
  TvShow,
  TvShowDetails,
  WatchProvidersResponse,
} from '../model/movie.types'

export function getTrendingMovies(page = 1) {
  return tmdbFetch<PaginatedResponse<Movie>>('/trending/movie/day', {
    page,
    language: 'pt-BR',
  })
}

export function getTrendingAll(page = 1) {
  return tmdbFetch<PaginatedResponse<Movie & { media_type: string; name?: string; first_air_date?: string }>>('/trending/all/day', {
    page,
    language: 'pt-BR',
  })
}

export function searchMulti(query: string, page = 1) {
  return tmdbFetch<PaginatedResponse<Movie & { media_type: string; name?: string; first_air_date?: string }>>('/search/multi', {
    query,
    page,
    language: 'pt-BR',
  })
}

export function getPopularMovies(page = 1) {
  return tmdbFetch<PaginatedResponse<Movie>>('/movie/popular', {
    page,
    language: 'pt-BR',
  })
}

export interface DiscoverParams {
  page?: number
  genreId?: number
  year?: number
  minRating?: number
}

export function discoverMovies(params: DiscoverParams = {}) {
  return tmdbFetch<PaginatedResponse<Movie>>('/discover/movie', {
    page: params.page ?? 1,
    with_genres: params.genreId,
    primary_release_year: params.year,
    sort_by: 'popularity.desc',
    language: 'pt-BR',
    'vote_average.gte': params.minRating,
  })
}

export function getUpcomingMovies(page = 1) {
  return tmdbFetch<PaginatedResponse<Movie>>('/movie/upcoming', {
    page,
    language: 'pt-BR',
    region: 'BR',
  })
}

export function searchMovies(query: string, page = 1) {
  return tmdbFetch<PaginatedResponse<Movie>>('/search/movie', {
    query,
    page,
    language: 'pt-BR',
  })
}

export function getMovieGenres() {
  return tmdbFetch<{ genres: Genre[] }>('/genre/movie/list', {
    language: 'pt-BR',
  })
}

export function getMovieDetails(movieId: number) {
  return tmdbFetch<MovieDetails>(`/movie/${movieId}`, {
    language: 'pt-BR',
  })
}

export function getMovieCredits(movieId: number) {
  return tmdbFetch<MovieCreditsResponse>(`/movie/${movieId}/credits`, {
    language: 'pt-BR',
  })
}

export function getMovieVideos(movieId: number) {
  return tmdbFetch<MovieVideosResponse>(`/movie/${movieId}/videos`, {
    language: 'pt-BR',
  })
}

export function getMovieRecommendations(movieId: number) {
  return tmdbFetch<PaginatedResponse<Movie>>(`/movie/${movieId}/recommendations`, {
    language: 'pt-BR',
  })
}

export function getMovieWatchProviders(movieId: number) {
  return tmdbFetch<WatchProvidersResponse>(`/movie/${movieId}/watch/providers`)
}

// TV Shows
export function getTrendingTv(page = 1) {
  return tmdbFetch<PaginatedResponse<TvShow>>('/trending/tv/day', { page, language: 'pt-BR' })
}

export function getPopularTv(page = 1) {
  return tmdbFetch<PaginatedResponse<TvShow>>('/tv/popular', { page, language: 'pt-BR' })
}

export function searchTv(query: string, page = 1) {
  return tmdbFetch<PaginatedResponse<TvShow>>('/search/tv', { query, page, language: 'pt-BR' })
}

export function getTvDetails(tvId: number) {
  return tmdbFetch<TvShowDetails>(`/tv/${tvId}`, { language: 'pt-BR' })
}

export function getTvCredits(tvId: number) {
  return tmdbFetch<MovieCreditsResponse>(`/tv/${tvId}/credits`, { language: 'pt-BR' })
}

export function getTvVideos(tvId: number) {
  return tmdbFetch<MovieVideosResponse>(`/tv/${tvId}/videos`, { language: 'pt-BR' })
}

export function getTvWatchProviders(tvId: number) {
  return tmdbFetch<WatchProvidersResponse>(`/tv/${tvId}/watch/providers`)
}
