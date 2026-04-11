import type { WatchProvider, WatchProviderCountry } from '@/entities/movie'

const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE

interface MovieWatchProvidersProps {
  providers: WatchProviderCountry
}

function ProviderList({ items, label }: { items: WatchProvider[]; label: string }) {
  if (items.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((provider) => (
          <a
            key={provider.provider_id}
            href={undefined}
            title={provider.provider_name}
            className="group relative"
          >
            <img
              src={`${IMAGE_BASE}/w92${provider.logo_path}`}
              alt={provider.provider_name}
              className="size-10 rounded-lg object-cover ring-1 ring-border transition-transform group-hover:scale-110"
            />
          </a>
        ))}
      </div>
    </div>
  )
}

export function MovieWatchProviders({ providers }: MovieWatchProvidersProps) {
  const hasAny = providers.flatrate?.length || providers.rent?.length || providers.buy?.length

  if (!hasAny) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Sem informações de streaming para o Brasil.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {providers.flatrate && (
        <ProviderList items={providers.flatrate} label="Streaming" />
      )}
      {providers.rent && (
        <ProviderList items={providers.rent} label="Alugar" />
      )}
      {providers.buy && (
        <ProviderList items={providers.buy} label="Comprar" />
      )}
      <p className="text-[11px] text-muted-foreground">
        Dados de disponibilidade por JustWatch.
      </p>
    </div>
  )
}
