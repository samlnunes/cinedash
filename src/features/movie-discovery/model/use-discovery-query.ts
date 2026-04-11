import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { movieQueries } from '@/entities/movie'
import { useDiscoveryStore } from './discovery.store'

export function useDiscoveryQuery() {
  const { tab, query, page, filters } = useDiscoveryStore()
  const debouncedQuery = useDebouncedValue(query, 400)

  return useQuery({
    ...movieQueries.discovery({ tab, page, query: debouncedQuery, filters }),
    placeholderData: (prev) => prev,
  })
}
