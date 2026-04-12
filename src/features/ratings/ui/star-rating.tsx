import { useState } from 'react'
import { Star } from 'lucide-react'
import { useMyRating, useSetRating, useRemoveRating } from '../hooks/use-ratings'

interface StarRatingProps {
  tmdbId: number
  size?: 'sm' | 'md'
}

export function StarRating({ tmdbId, size = 'md' }: StarRatingProps) {
  const { data: existing } = useMyRating(tmdbId)
  const setRating = useSetRating()
  const removeRating = useRemoveRating()
  const [hover, setHover] = useState(0)

  const currentRating = existing?.rating ?? 0
  const display = hover || currentRating
  const iconSize = size === 'sm' ? 'size-4' : 'size-5'

  const handleClick = (value: number) => {
    if (value === currentRating) {
      removeRating.mutate(tmdbId)
    } else {
      setRating.mutate({ tmdbId, rating: value })
    }
  }

  return (
    <div
      className="flex items-center gap-0.5"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          className="transition-transform hover:scale-110"
          onMouseEnter={() => setHover(value)}
          onClick={() => handleClick(value)}
          disabled={setRating.isPending || removeRating.isPending}
        >
          <Star
            className={`${iconSize} transition-colors ${
              value <= display
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  )
}
