import { AlertCircle, SearchX, BookmarkPlus, BookmarkMinus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { MovieCard, MovieCardSkeleton, type Movie } from '@/entities/movie'
import {
  DiscoveryTabs,
  DiscoveryFilters,
  DiscoveryPagination,
  useDiscoveryQuery,
  usePrefetchNextPage,
} from '@/features/movie-discovery'
import { useWatchlistStore } from '@/features/watchlist'
import { RequestButton } from '@/features/requests'

const SKELETON_COUNT = 12

export function DiscoveryDashboard() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useDiscoveryQuery()

  usePrefetchNextPage(data?.total_pages ?? 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard de Descoberta
          </h1>
          <p className="text-muted-foreground">
            Explore filmes em alta e populares.
          </p>
        </div>
        <DiscoveryTabs />
      </div>

      <DiscoveryFilters />

      {isLoading || isFetching && <MovieGrid skeleton />}

      {isError && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertCircle className="size-10 text-destructive" />
          <p className="text-sm text-muted-foreground">
            {error?.message ?? 'Erro ao carregar filmes.'}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {data && data.results.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <SearchX className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhum filme encontrado. Tente ajustar seus filtros.
          </p>
        </div>
      )}

      {data && data.results.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {data.results.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                actions={
                  <div className="flex flex-col gap-1">
                    <WatchlistToggle movie={movie} />
                    <RequestButton movie={movie} />
                  </div>
                }
              />
            ))}
          </div>

          <DiscoveryPagination totalPages={data.total_pages} />
        </>
      )}
    </div>
  )
}

function WatchlistToggle({ movie }: { movie: Movie }) {
  const toggle = useWatchlistStore((s) => s.toggle)
  const inList = useWatchlistStore((s) => s.has(movie.id))

  return (
    <Button
      variant={inList ? 'outline' : 'secondary'}
      size="xs"
      className="w-full"
      onClick={() => toggle(movie)}
    >
      {inList ? (
        <>
          <BookmarkMinus className="size-3" />
          Remover da minha lista
        </>
      ) : (
        <>
          <BookmarkPlus className="size-3" />
          Adicionar à minha lista
        </>
      )}
    </Button>
  )
}

function MovieGrid({ skeleton }: { skeleton: boolean }) {
  if (!skeleton) return null

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  )
}
