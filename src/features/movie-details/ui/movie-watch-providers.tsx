import type { WatchProviderCountry } from '@/entities/movie'

const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE

interface MovieWatchProvidersProps {
  providers: WatchProviderCountry
}

export function MovieWatchProviders({ providers }: MovieWatchProvidersProps) {
  const all = [
    ...(providers.flatrate ?? []),
    ...(providers.rent ?? []),
    ...(providers.buy ?? []),
  ]

  // deduplicate by provider_id
  const unique = all.filter(
    (p, i, arr) => arr.findIndex((x) => x.provider_id === p.provider_id) === i,
  )

  if (unique.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Sem informações de streaming para o Brasil.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {unique.map((provider) => (
        <img
          key={provider.provider_id}
          src={`${IMAGE_BASE}/w92${provider.logo_path}`}
          alt={provider.provider_name}
          title={provider.provider_name}
          className="size-9 rounded-lg object-cover ring-1 ring-border"
        />
      ))}
    </div>
  )
}
