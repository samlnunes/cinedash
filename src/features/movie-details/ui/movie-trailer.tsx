import { VideoOff } from 'lucide-react'
import type { MovieVideo } from '@/entities/movie'

interface MovieTrailerProps {
  trailer: MovieVideo | null
}

export function MovieTrailer({ trailer }: MovieTrailerProps) {
  if (!trailer) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 py-16 text-muted-foreground">
        <VideoOff className="size-8" />
        <p className="text-sm">Trailer indisponível</p>
      </div>
    )
  }

  return (
    <div className="aspect-video overflow-hidden rounded-lg">
      <iframe
        src={`https://www.youtube.com/embed/${trailer.key}`}
        title={trailer.name}
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  )
}
