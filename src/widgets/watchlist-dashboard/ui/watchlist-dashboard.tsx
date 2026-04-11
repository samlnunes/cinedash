import { ListX } from 'lucide-react'
import { useWatchlistStore, WatchlistTable } from '@/features/watchlist'

export function WatchlistDashboard() {
  const count = useWatchlistStore((s) => s.items.length)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Minha Lista</h1>
        <p className="text-muted-foreground">
          {count === 0
            ? 'Sua lista está vazia. Adicione filmes a partir do Dashboard de Descoberta.'
            : `${count} ${count === 1 ? 'filme' : 'filmes'} na sua lista.`}
        </p>
      </div>

      {count === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <ListX className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhum filme adicionado ainda.
          </p>
        </div>
      ) : (
        <WatchlistTable />
      )}
    </div>
  )
}
