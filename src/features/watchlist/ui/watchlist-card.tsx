import { useNavigate } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { posterUrl } from '@/shared/api/tmdb/client'
import { Button } from '@/shared/ui/button'
import { StarRating } from '@/features/ratings'
import { ReminderButton } from '@/features/reminders'
import { useRemoveFromWatchlist } from '../hooks/use-watchlist'
import type { Database } from '@/lib/database.types'

type WatchlistItem = Database['public']['Tables']['watchlist']['Row']

interface WatchlistCardProps {
  item: WatchlistItem
}

export function WatchlistCard({ item }: WatchlistCardProps) {
  const remove = useRemoveFromWatchlist()
  const navigate = useNavigate()
  const isTv = item.media_type === 'tv'

  const goToDetails = () => {
    if (isTv) {
      navigate({ to: '/tv/$tvId', params: { tvId: String(item.tmdb_id) } })
    } else {
      navigate({ to: '/movie/$movieId', params: { movieId: String(item.tmdb_id) } })
    }
  }

  return (
    <div
      className="flex gap-4 rounded-lg border bg-card p-4 cursor-pointer transition-colors hover:bg-accent/50 overflow-hidden"
      onClick={goToDetails}
    >
      <img
        src={posterUrl(item.poster_path, 'w185')}
        alt={item.title}
        className="h-32 w-24 rounded object-cover shrink-0"
      />
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        <p className="text-base font-medium line-clamp-2">{item.title}</p>
        {item.year && (
          <p className="text-sm text-muted-foreground">{item.year}</p>
        )}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <StarRating tmdbId={item.tmdb_id} size="sm" />
          {item.vote_average != null && (
            <span className="text-sm text-muted-foreground">{item.vote_average.toFixed(1)}</span>
          )}
        </div>
        <div className="flex items-center justify-between mt-auto" onClick={(e) => e.stopPropagation()}>
          <p className="text-sm text-muted-foreground">
            {new Date(item.added_at).toLocaleDateString('pt-BR')}
          </p>
          <div className="flex items-center gap-1">
            <ReminderButton tmdbId={item.tmdb_id} title={item.title} posterPath={item.poster_path} />
            <Button
              variant="ghost"
              size="xs"
              className="text-destructive hover:text-destructive"
              onClick={() => remove.mutate(item.tmdb_id)}
              disabled={remove.isPending}
            >
              <X className="size-3" />
              Remover
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
