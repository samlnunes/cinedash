import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { Star, Calendar, Tv } from 'lucide-react'
import { posterUrl } from '@/shared/api/tmdb/client'
import type { Movie } from '../model/movie.types'

interface MovieCardProps {
  movie: Movie & { media_type?: string; name?: string; first_air_date?: string }
  actions?: ReactNode
  posterOverlay?: ReactNode
}

export function MovieCard({ movie, actions, posterOverlay }: MovieCardProps) {
  const isTv = movie.media_type === 'tv'
  const title = isTv ? (movie.name ?? movie.title) : movie.title
  const date = isTv ? (movie.first_air_date ?? movie.release_date) : movie.release_date
  const year = date?.split('-')[0] ?? '—'
  const rating = movie.vote_average.toFixed(1)
  const linkTo = isTv ? '/tv/$tvId' : '/movie/$movieId'
  const linkParams = isTv ? { tvId: String(movie.id) } : { movieId: String(movie.id) }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg">
      <Link
        to={linkTo}
        params={linkParams}
        className="relative aspect-[2/3] overflow-hidden bg-muted"
      >
        <img
          src={posterUrl(movie.poster_path)}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {isTv && (
          <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-blue-500/90 px-2 py-0.5 text-[10px] font-medium text-white">
            <Tv className="size-3" />
            Série
          </span>
        )}
      </Link>
      {posterOverlay && (
        <div className="absolute top-2 right-2 z-10">{posterOverlay}</div>
      )}

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
          {title}
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
