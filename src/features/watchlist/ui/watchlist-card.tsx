import { Link } from '@tanstack/react-router'
import { Eye, X, Star } from 'lucide-react'
import { posterUrl } from '@/shared/api/tmdb/client'
import { Button } from '@/shared/ui/button'
import { useRemoveFromWatchlist } from '../hooks/use-watchlist'
import type { Database } from '@/lib/database.types'

type WatchlistItem = Database['public']['Tables']['watchlist']['Row']

interface WatchlistCardProps {
  item: WatchlistItem
}

export function WatchlistCard({ item }: WatchlistCardProps) {
  const remove = useRemoveFromWatchlist()

  return (
    <div className="flex gap-4 rounded-lg border bg-card p-4">
      <Link
        to="/movie/$movieId"
        params={{ movieId: String(item.tmdb_id) }}
      >
        <img
          src={posterUrl(item.poster_path, 'w185')}
          alt={item.title}
          className="h-28 w-20 rounded object-cover shrink-0 hover:opacity-80 transition-opacity"
        />
      </Link>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            to="/movie/$movieId"
            params={{ movieId: String(item.tmdb_id) }}
            className="font-medium truncate hover:underline"
          >
            {item.title}
          </Link>
        </div>
        {item.year && (
          <p className="text-sm text-muted-foreground">{item.year}</p>
        )}
        {item.vote_average != null && (
          <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
            <Star className="size-3 fill-yellow-400 text-yellow-400" />
            {item.vote_average.toFixed(1)}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <p className="text-xs text-muted-foreground">
            {new Date(item.added_at).toLocaleDateString('pt-BR')}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="xs" asChild>
              <Link
                to="/movie/$movieId"
                params={{ movieId: String(item.tmdb_id) }}
              >
                <Eye className="size-3" />
                Detalhes
              </Link>
            </Button>
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
