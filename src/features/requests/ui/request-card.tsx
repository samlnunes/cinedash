import { X } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { posterUrl } from '@/shared/api/tmdb/client'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { JellyfinBadge } from '@/features/jellyfin'
import type { Request } from '../types/request.types'
import {
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_COLORS,
} from '../types/request.types'
import { useCancelRequest } from '../hooks/use-requests'

interface RequestCardProps {
  request: Request
}

export function RequestCard({ request }: RequestCardProps) {
  const cancel = useCancelRequest()
  const canCancel = request.status === 'pending'

  return (
    <div className="flex gap-4 rounded-lg border bg-card p-4">
      <Link
        to="/movie/$movieId"
        params={{ movieId: String(request.tmdb_id) }}
        className="shrink-0"
      >
        <img
          src={posterUrl(request.poster_path, 'w185')}
          alt={request.title}
          className="h-28 w-20 rounded object-cover transition-opacity hover:opacity-80"
        />
      </Link>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to="/movie/$movieId"
              params={{ movieId: String(request.tmdb_id) }}
              className="font-medium truncate hover:underline"
            >
              {request.title}
            </Link>
            <div className="flex gap-1.5 mt-1">
              <JellyfinBadge tmdbId={request.tmdb_id} />
            </div>
          </div>
          <Badge
            className={REQUEST_STATUS_COLORS[request.status]}
          >
            {REQUEST_STATUS_LABELS[request.status]}
          </Badge>
        </div>
        {request.year && (
          <p className="text-sm text-muted-foreground">{request.year}</p>
        )}
        {request.note && (
          <p className="text-sm text-muted-foreground mt-1">
            {request.note}
          </p>
        )}
        {request.admin_note && (
          <p className="text-sm text-muted-foreground mt-1 italic">
            Admin: {request.admin_note}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <p className="text-xs text-muted-foreground">
            {new Date(request.created_at).toLocaleDateString('pt-BR')}
          </p>
          {canCancel && (
            <Button
              variant="ghost"
              size="xs"
              className="text-destructive hover:text-destructive"
              onClick={() => cancel.mutate(request.id)}
              disabled={cancel.isPending}
            >
              <X className="size-3" />
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
