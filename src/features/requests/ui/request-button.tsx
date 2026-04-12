import { useState } from 'react'
import { Play, Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import type { Movie } from '@/entities/movie'
import { useHasRequested } from '../hooks/use-requests'
import { useJellyfinAvailability } from '@/features/jellyfin'
import { REQUEST_STATUS_LABELS } from '../types/request.types'
import { RequestModal } from './request-modal'

const JELLYFIN_URL = import.meta.env.VITE_JELLYFIN_URL

interface RequestButtonProps {
  movie: Movie
}

export function RequestButton({ movie }: RequestButtonProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { data: existing, isLoading } = useHasRequested(movie.id)
  const { data: jellyfin } = useJellyfinAvailability(movie.id)

  if (isLoading) return null

  if (jellyfin?.available && jellyfin.jellyfin_id) {
    return (
      <Button variant="outline" size="xs" className="w-full text-green-500 border-green-500/30 hover:text-green-400" asChild>
        <a href={`${JELLYFIN_URL}/web/index.html#!/details?id=${jellyfin.jellyfin_id}`} target="_blank" rel="noopener noreferrer">
          <Play className="size-3" />
          Assistir
        </a>
      </Button>
    )
  }

  if (existing) {
    return (
      <Button variant="outline" size="xs" className="w-full" disabled>
        {REQUEST_STATUS_LABELS[existing.status as keyof typeof REQUEST_STATUS_LABELS]}
      </Button>
    )
  }

  return (
    <>
      <Button variant="secondary" size="xs" className="w-full" onClick={() => setModalOpen(true)}>
        <Plus className="size-3" />
        Solicitar
      </Button>
      <RequestModal
        movie={movie}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  )
}
