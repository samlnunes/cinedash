import { useQuery } from '@tanstack/react-query'
import { movieQueries } from '@/entities/movie'

export function useGenresQuery() {
  return useQuery({
    ...movieQueries.genres(),
    select: (data) => data.genres,
  })
}
