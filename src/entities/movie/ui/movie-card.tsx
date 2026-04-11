import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { Star, Calendar } from 'lucide-react'
import { posterUrl } from '@/shared/api/tmdb/client'
import type { Movie } from '../model/movie.types'

interface MovieCardProps {
  movie: Movie
  actions?: ReactNode
}

export function MovieCard({ movie, actions }: MovieCardProps) {
  const year = movie.release_date?.split('-')[0] ?? '—'
  const rating = movie.vote_average.toFixed(1)

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg">
      <Link
        to="/movie/$movieId"
        params={{ movieId: String(movie.id) }}
        className="relative aspect-[2/3] overflow-hidden bg-muted"
      >
        <img
          src={posterUrl(movie.poster_path)}
          alt={movie.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
          {movie.title}
        </h3>

        <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3" />
            {year}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="size-3 fill-yellow-400 text-yellow-400" />
            {rating}
          </span>
        </div>

        {actions && <div className="mt-2">{actions}</div>}
      </div>
    </div>
  )
}
