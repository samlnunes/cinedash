import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { MovieCard, MovieCardSkeleton, movieQueries } from '@/entities/movie'
import { RequestButton } from '@/features/requests'

export function UpcomingDashboard() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery(movieQueries.upcoming(page))

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Calendar className="size-6 text-orange-500" />
          <h1 className="text-3xl font-bold tracking-tight">Em Breve</h1>
        </div>
        <p className="text-muted-foreground">
          Filmes que ainda não estrearam. Solicite para ter no servidor assim que lançar.
        </p>
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
            {data.results.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                actions={
                  <div className="flex flex-col gap-1">
                    <RequestButton movie={movie} />
                  </div>
                }
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {data.total_pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
              disabled={page >= data.total_pages}
            >
              Próxima
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
