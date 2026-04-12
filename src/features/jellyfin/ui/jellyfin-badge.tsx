import { Server } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { useJellyfinAvailability } from '../hooks/use-jellyfin-availability'

interface JellyfinBadgeProps {
  tmdbId: number
}

export function JellyfinBadge({ tmdbId }: JellyfinBadgeProps) {
  const { data } = useJellyfinAvailability(tmdbId)

  if (!data?.available) return null

  return (
    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 gap-1">
      <Server className="size-3" />
      No servidor
    </Badge>
  )
}
