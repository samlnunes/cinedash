import { Users } from 'lucide-react'
import { posterUrl } from '@/shared/api/tmdb/client'
import type { CastMember } from '@/entities/movie'
import { Button } from '@/shared/ui/button'
import { useState } from 'react'

interface MovieCastListProps {
  cast: CastMember[]
  defaultLimit?: number
}

export function MovieCastList({ cast, defaultLimit = 12 }: MovieCastListProps) {
  const [limit, setLimit] = useState(defaultLimit)

  if (cast.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 py-12 text-muted-foreground">
        <Users className="size-8" />
        <p className="text-sm">Elenco indisponível</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
      {cast.slice(0, limit).map((member) => (
        <div key={member.id} className="flex flex-col items-center gap-1.5">
          <img
            src={posterUrl(member.profile_path, 'w185')}
            alt={member.name}
            loading="lazy"
            className="size-20 rounded-full object-cover bg-muted"
          />
          <div className="text-center">
            <p className="text-xs font-medium leading-tight line-clamp-1">
              {member.name}
            </p>
            <p className="text-xs text-muted-foreground leading-tight line-clamp-1">
              {member.character}
            </p>
          </div>
        </div>
      ))}

      {cast.length > defaultLimit && (
        <div className="col-span-full flex justify-center mt-4">
          <Button variant="outline" size="sm" onClick={() => setLimit(limit === cast.length ? 12 : cast.length)}>
            {limit === cast.length ? 'Ver menos' : 'Ver todos'}
          </Button>
        </div>
      )}
    </div>
  )
}
