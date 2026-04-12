import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { Star, Calendar } from 'lucide-react'
import { posterUrl } from '@/shared/api/tmdb/client'
import type { TvShow } from '../model/movie.types'

interface TvCardProps {
  show: TvShow
  actions?: ReactNode
}

export function TvCard({ show, actions }: TvCardProps) {
  const year = show.first_air_date?.split('-')[0] ?? '—'
  const rating = show.vote_average.toFixed(1)

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg">
      <Link
        to="/tv/$tvId"
        params={{ tvId: String(show.id) }}
        className="relative aspect-[2/3] overflow-hidden bg-muted"
      >
        <img
          src={posterUrl(show.poster_path)}
          alt={show.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
          {show.name}
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
