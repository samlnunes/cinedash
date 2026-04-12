import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Search, Star } from 'lucide-react'
import { Dialog, DialogContent } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { posterUrl } from '@/shared/api/tmdb/client'
import { searchMovies } from '@/entities/movie/api/movie.api'
import type { Movie } from '@/entities/movie'

export function SearchCommand() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Ctrl+K listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [open])

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const data = await searchMovies(q)
      setResults(data.results.slice(0, 8))
      setSelectedIndex(0)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 300)
  }

  const goToMovie = (movie: Movie) => {
    setOpen(false)
    navigate({ to: '/movie/$movieId', params: { movieId: String(movie.id) } })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      goToMovie(results[selectedIndex])
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 gap-0 max-w-lg [&>button]:hidden">
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            placeholder="Buscar filmes..."
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 shadow-none focus-visible:ring-0 h-12"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {results.length > 0 && (
          <div className="max-h-80 overflow-y-auto p-2">
            {results.map((movie, i) => (
              <button
                key={movie.id}
                onClick={() => goToMovie(movie)}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors ${
                  i === selectedIndex ? 'bg-accent' : 'hover:bg-accent/50'
                }`}
              >
                <img
                  src={posterUrl(movie.poster_path, 'w185')}
                  alt={movie.title}
                  className="h-14 w-10 rounded object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{movie.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {movie.release_date && (
                      <span>{movie.release_date.slice(0, 4)}</span>
                    )}
                    {movie.vote_average > 0 && (
                      <span className="inline-flex items-center gap-0.5">
                        <Star className="size-3 fill-yellow-400 text-yellow-400" />
                        {movie.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {query.length >= 2 && results.length === 0 && !loading && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Nenhum filme encontrado.
          </div>
        )}

        {loading && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Buscando...
          </div>
        )}

        {query.length < 2 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Digite para buscar filmes...
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
