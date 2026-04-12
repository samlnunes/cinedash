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

  const hasFilters = filters.genreId !== undefined

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar filmes e séries..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
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

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <X className="size-4" />
          Limpar
        </Button>
      )}
    </div>
  )
}
