import { X } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
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
import { DownloadProgress } from './download-progress'

interface RequestCardProps {
  request: Request
}

export function RequestCard({ request }: RequestCardProps) {
  const cancel = useCancelRequest()
  const canCancel = request.status === 'pending'
  const navigate = useNavigate()
  const isTv = request.media_type === 'tv'

  const goToDetails = () => {
    if (isTv) {
      navigate({ to: '/tv/$tvId', params: { tvId: String(request.tmdb_id) } })
    } else {
      navigate({ to: '/movie/$movieId', params: { movieId: String(request.tmdb_id) } })
    }
  }

  return (
    <div
      className="flex gap-4 rounded-lg border bg-card p-4 cursor-pointer transition-colors hover:bg-accent/50 overflow-hidden"
      onClick={goToDetails}
    >
      <img
        src={posterUrl(request.poster_path, 'w185')}
        alt={request.title}
        className="h-32 w-24 rounded object-cover shrink-0"
      />
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-base font-medium line-clamp-2 min-w-0">{request.title}</p>
          <Badge className={`shrink-0 text-xs ${REQUEST_STATUS_COLORS[request.status]}`}>
            {REQUEST_STATUS_LABELS[request.status]}
          </Badge>
        </div>
        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
          <JellyfinBadge tmdbId={request.tmdb_id} />
        </div>
        {request.note && (
          <p className="text-sm text-muted-foreground italic truncate">
            "{request.note}"
          </p>
        )}
        {request.admin_note && (
          <p className="text-sm text-destructive italic truncate">
            {request.admin_note}
          </p>
        )}
        <DownloadProgress request={request} className="mt-1" />
        <div className="flex items-center justify-between mt-auto" onClick={(e) => e.stopPropagation()}>
          <span className="text-sm text-muted-foreground">
            {new Date(request.created_at).toLocaleDateString('pt-BR')}
          </span>
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
