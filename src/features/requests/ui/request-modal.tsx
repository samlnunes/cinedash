import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'
import { Label } from '@/shared/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { posterUrl } from '@/shared/api/tmdb/client'
import type { Movie } from '@/entities/movie'
import { useCreateRequest } from '../hooks/use-requests'

interface RequestModalProps {
  movie: Movie | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RequestModal({ movie, open, onOpenChange }: RequestModalProps) {
  const [note, setNote] = useState('')
  const createRequest = useCreateRequest()

  if (!movie) return null

  const handleSubmit = async () => {
    await createRequest.mutateAsync({
      tmdb_id: movie.id,
      media_type: 'movie',
      title: movie.title,
      poster_path: movie.poster_path,
      year: movie.release_date?.slice(0, 4) ?? null,
      vote_average: movie.vote_average,
      note: note.trim() || null,
    })

    setNote('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pedir filme</DialogTitle>
          <DialogDescription>
            Solicite a adição deste filme ao servidor.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4">
          <img
            src={posterUrl(movie.poster_path, 'w185')}
            alt={movie.title}
            className="h-36 w-24 rounded object-cover"
          />
          <div className="flex flex-col gap-1">
            <p className="font-medium">{movie.title}</p>
            {movie.release_date && (
              <p className="text-sm text-muted-foreground">
                {movie.release_date.slice(0, 4)}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {movie.vote_average.toFixed(1)} / 10
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="request-note">Observação (opcional)</Label>
          <Textarea
            id="request-note"
            placeholder="Ex: Preferência por áudio em PT-BR"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createRequest.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createRequest.isPending}
          >
            {createRequest.isPending ? 'Enviando...' : 'Enviar pedido'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
