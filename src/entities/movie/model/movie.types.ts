export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  original_language: string
  popularity?: number
}

export interface Genre {
  id: number
  name: string
}

export interface PaginatedResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export interface MovieDetails {
  id: number
  title: string
  overview: string
  tagline: string | null
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genres: Genre[]
  runtime: number | null
  status: string
  original_language: string
  budget: number
  revenue: number
}

export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface CrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export interface MovieCreditsResponse {
  id: number
  cast: CastMember[]
  crew: CrewMember[]
}

export interface MovieVideo {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
}

export interface MovieVideosResponse {
  id: number
  results: MovieVideo[]
}
