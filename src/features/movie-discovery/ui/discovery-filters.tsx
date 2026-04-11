import { Search, X } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { useDiscoveryStore } from '../model/discovery.store'
import { useGenresQuery } from '../model/use-genres-query'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

export function DiscoveryFilters() {
  const { query, filters, setQuery, setFilters, resetFilters } =
    useDiscoveryStore()
  const { data: genres } = useGenresQuery()

  const hasFilters =
    filters.genreId !== undefined ||
    filters.year !== undefined ||
    filters.minRating !== undefined

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar filmes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={filters.genreId?.toString() ?? ''} onValueChange={(value) => setFilters({ genreId: value ? Number(value) : undefined })}>
        <SelectTrigger>
          <SelectValue placeholder="Todos os gêneros" />
          <SelectContent>
            {genres?.map((g) => (
              <SelectItem key={g.id} value={g.id.toString()} >
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectTrigger>
      </Select>

      <Input
        type="number"
        placeholder="Ano"
        min={1900}
        max={new Date().getFullYear()}
        value={filters.year ?? ''}
        onChange={(e) =>
          setFilters({
            year: e.target.value ? Number(e.target.value) : undefined,
          })
        }
        className="w-24"
      />

      <Input
        type="number"
        placeholder="Nota min."
        min={0}
        max={10}
        step={0.5}
        value={filters.minRating ?? ''}
        onChange={(e) =>
          setFilters({
            minRating: e.target.value ? Number(e.target.value) : undefined,
          })
        }
        className="w-28"
      />

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <X className="size-4" />
          Limpar
        </Button>
      )}
    </div>
  )
}
