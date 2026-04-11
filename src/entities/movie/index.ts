export { MovieCard } from './ui/movie-card'
export { MovieCardSkeleton } from './ui/movie-card-skeleton'

export {
  getTrendingMovies,
  getPopularMovies,
  discoverMovies,
  searchMovies,
  getMovieGenres,
  getMovieDetails,
  getMovieCredits,
  getMovieVideos,
} from './api/movie.api'
export type { DiscoverParams } from './api/movie.api'

export type {
  Movie,
  Genre,
  PaginatedResponse,
  MovieDetails,
  CastMember,
  CrewMember,
  MovieCreditsResponse,
  MovieVideo,
  MovieVideosResponse,
} from './model/movie.types'

export { movieKeys, movieQueries } from './api/movie.queries'
