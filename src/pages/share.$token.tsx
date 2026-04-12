import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Star, ListX } from 'lucide-react'
import { posterUrl } from '@/shared/api/tmdb/client'
import { supabase } from '@/lib/supabase'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'

export const Route = createFileRoute('/share/$token')({
  component: SharedWatchlistPage,
})

function SharedWatchlistPage() {
  const { token } = Route.useParams()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['shared-watchlist', token],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('public-watchlist', {
        body: { token },
      })
      if (error) throw error
      return data as {
        user: { display_name: string; avatar_url: string | null }
        items: Array<{
          id: string
          tmdb_id: number
          media_type: string
          title: string
          poster_path: string | null
          year: string | null
          vote_average: number | null
          added_at: string
        }>
      }
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-lg border bg-muted" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Lista não encontrada.</p>
      </div>
    )
  }

  const initials = data.user.display_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src={data.user.avatar_url ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Lista de {data.user.display_name}</h1>
            <p className="text-sm text-muted-foreground">{data.items.length} {data.items.length === 1 ? 'título' : 'títulos'}</p>
          </div>
        </div>

        {data.items.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <ListX className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Lista vazia.</p>
          </div>
        )}

        {data.items.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-lg border bg-card p-4">
                <img
                  src={posterUrl(item.poster_path, 'w185')}
                  alt={item.title}
                  className="h-28 w-20 rounded object-cover shrink-0"
                />
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <p className="font-medium truncate">{item.title}</p>
                  {item.year && (
                    <p className="text-sm text-muted-foreground">{item.year}</p>
                  )}
                  {item.vote_average != null && (
                    <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
                      <Star className="size-3 fill-yellow-400 text-yellow-400" />
                      {item.vote_average.toFixed(1)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-auto">
                    {new Date(item.added_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
