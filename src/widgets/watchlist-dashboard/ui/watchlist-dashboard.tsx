import { useState } from 'react'
import { ListX, Share2, Check } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { useWatchlist, WatchlistCard } from '@/features/watchlist'
import { useAuthStore } from '@/features/auth'

export function WatchlistDashboard() {
  const { data: items, isLoading } = useWatchlist()
  const profile = useAuthStore((s) => s.profile)
  const count = items?.length ?? 0
  const [copied, setCopied] = useState(false)

  const shareUrl = profile?.share_token
    ? `${window.location.origin}/share/${profile.share_token}`
    : null

  const handleShare = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minha Lista</h1>
          <p className="text-muted-foreground">
            {count === 0 && !isLoading
              ? 'Sua lista está vazia. Adicione filmes a partir do Dashboard de Descoberta.'
              : `${count} ${count === 1 ? 'título' : 'títulos'} na sua lista.`}
          </p>
        </div>
        {count > 0 && shareUrl && (
          <Button variant="outline" size="sm" onClick={handleShare}>
            {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
            {copied ? 'Link copiado!' : 'Compartilhar'}
          </Button>
        )}
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
