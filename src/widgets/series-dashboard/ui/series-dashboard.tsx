import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tv, Search } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { MovieCardSkeleton, TvCard, type TvShow } from '@/entities/movie'
import { getTrendingTv, getPopularTv, searchTv } from '@/entities/movie/api/movie.api'

type Tab = 'trending' | 'popular'

export function SeriesDashboard() {
  const [tab, setTab] = useState<Tab>('trending')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const isSearching = query.trim().length > 0

  const { data, isLoading } = useQuery({
    queryKey: ['tv', isSearching ? 'search' : tab, isSearching ? query : '', page],
    queryFn: () => {
      if (isSearching) return searchTv(query.trim(), page)
      return tab === 'trending' ? getTrendingTv(page) : getPopularTv(page)
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Tv className="size-6 text-blue-500" />
            <h1 className="text-3xl font-bold tracking-tight">Séries</h1>
          </div>
          <p className="text-muted-foreground">Explore séries em alta e populares.</p>
        </div>
        <div className="flex rounded-lg border bg-muted p-0.5">
          <Button
            variant={tab === 'trending' && !isSearching ? 'default' : 'ghost'}
            size="sm"
            onClick={() => { setTab('trending'); setQuery(''); setPage(1) }}
          >
            Em alta
          </Button>
          <Button
            variant={tab === 'popular' && !isSearching ? 'default' : 'ghost'}
            size="sm"
            onClick={() => { setTab('popular'); setQuery(''); setPage(1) }}
          >
            Populares
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar séries..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1) }}
          className="pl-9"
        />
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }, (_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      )}

      {data && data.results.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {data.results.map((show: TvShow) => (
              <TvCard key={show.id} show={show} />
            ))}
          </div>

          {data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">{page} / {data.total_pages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.total_pages}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}

      {data && data.results.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Tv className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nenhuma série encontrada.</p>
        </div>
      )}
    </div>
  )
}
