import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { movieQueries } from '@/entities/movie'
import { useDiscoveryStore } from './discovery.store'

export function usePrefetchNextPage(totalPages: number) {
  const queryClient = useQueryClient()
  const { tab, query, page, filters } = useDiscoveryStore()
  const debouncedQuery = useDebouncedValue(query, 400)

  useEffect(() => {
    if (page >= Math.min(totalPages, 500)) return

    queryClient.prefetchQuery(
      movieQueries.discovery({
        tab,
        page: page + 1,
        query: debouncedQuery,
        filters,
      }),
    )
  }, [queryClient, tab, page, debouncedQuery, filters, totalPages])
}
