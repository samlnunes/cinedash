import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface JellyfinResult {
  available: boolean
  jellyfin_id?: string
}

async function checkJellyfin(tmdbIds: number[]): Promise<Record<number, JellyfinResult>> {
  const { data, error } = await supabase.functions.invoke('jellyfin-check-availability', {
    body: { tmdb_ids: tmdbIds },
  })

  if (error) throw error
  return data.results
}

export function useJellyfinAvailability(tmdbId: number) {
  return useQuery({
    queryKey: ['jellyfin', tmdbId],
    queryFn: async () => {
      const results = await checkJellyfin([tmdbId])
      return results[tmdbId] ?? { available: false }
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useJellyfinBatch(tmdbIds: number[]) {
  return useQuery({
    queryKey: ['jellyfin', 'batch', ...tmdbIds],
    queryFn: () => checkJellyfin(tmdbIds),
    staleTime: 1000 * 60 * 5,
    enabled: tmdbIds.length > 0,
  })
}
