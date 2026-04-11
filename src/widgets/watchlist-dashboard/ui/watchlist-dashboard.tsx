import { ListX } from 'lucide-react'
import { useWatchlist, WatchlistCard } from '@/features/watchlist'

export function WatchlistDashboard() {
  const { data: items, isLoading } = useWatchlist()
  const count = items?.length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Minha Lista</h1>
        <p className="text-muted-foreground">
          {count === 0 && !isLoading
            ? 'Sua lista está vazia. Adicione filmes a partir do Dashboard de Descoberta.'
            : `${count} ${count === 1 ? 'filme' : 'filmes'} na sua lista.`}
        </p>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-lg border bg-muted"
            />
          ))}
        </div>
      )}

      {!isLoading && count === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <ListX className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhum filme adicionado ainda.
          </p>
        </div>
      )}

      {items && items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <WatchlistCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
