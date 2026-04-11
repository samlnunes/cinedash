import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import type { Movie } from '@/entities/movie'
import { useHasRequested } from '../hooks/use-requests'
import { REQUEST_STATUS_LABELS } from '../types/request.types'
import { RequestModal } from './request-modal'

interface RequestButtonProps {
  movie: Movie
}

export function RequestButton({ movie }: RequestButtonProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { data: existing, isLoading } = useHasRequested(movie.id)

  if (isLoading) return null

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
