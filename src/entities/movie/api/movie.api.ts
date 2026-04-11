import { tmdbFetch } from '@/shared/api/tmdb/client'
import type {
  Genre,
  Movie,
  MovieCreditsResponse,
  MovieDetails,
  MovieVideosResponse,
  PaginatedResponse,
  WatchProvidersResponse,
} from '../model/movie.types'

export function getTrendingMovies(page = 1) {
  return tmdbFetch<PaginatedResponse<Movie>>('/trending/movie/day', {
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

export function getMovieWatchProviders(movieId: number) {
  return tmdbFetch<WatchProvidersResponse>(`/movie/${movieId}/watch/providers`)
}
