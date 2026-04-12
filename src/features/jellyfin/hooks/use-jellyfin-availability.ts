import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface JellyfinResult {
  available: boolean
  jellyfin_id?: string
}

export interface RecentJellyfinMovie {
  jellyfin_id: string
  tmdb_id: string
  title: string
  year: number | null
  rating: number | null
  added_at: string
}

interface JellyfinLibraryData {
  movies: Record<string, string>
  recent: RecentJellyfinMovie[]
}

async function fetchJellyfinLibrary(): Promise<JellyfinLibraryData> {
  const { data, error } = await supabase.functions.invoke('jellyfin-list-all')

  if (error) throw error
  return { movies: data.movies, recent: data.recent ?? [] }
}

export function useJellyfinLibrary() {
  return useQuery({
    queryKey: ['jellyfin', 'library'],
    queryFn: fetchJellyfinLibrary,
    staleTime: 1000 * 60 * 10,
  })
}

export function useJellyfinAvailability(tmdbId: number): { data: JellyfinResult | undefined; isLoading: boolean } {
  const { data: library, isLoading } = useJellyfinLibrary()

  if (!library) return { data: undefined, isLoading }

  const jellyfinId = library.movies[String(tmdbId)]
  return {
    data: jellyfinId
      ? { available: true, jellyfin_id: jellyfinId }
      : { available: false },
    isLoading: false,
  }
}

export function useJellyfinRecent() {
  const { data: library, isLoading } = useJellyfinLibrary()
  return { data: library?.recent ?? [], isLoading }
}
