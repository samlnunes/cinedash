import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowUpDown, ArrowUp, ArrowDown, Eye, Trash2 } from 'lucide-react'
import { movieQueries, type Movie } from '@/entities/movie'
import { Button } from '@/shared/ui/button'
import { useWatchlistStore } from '../model/watchlist.store'

const columnHelper = createColumnHelper<Movie>()

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (sorted === 'asc') return <ArrowUp className="size-3.5" />
  if (sorted === 'desc') return <ArrowDown className="size-3.5" />
  return <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
}

export function WatchlistTable() {
  const items = useWatchlistStore((s) => s.items)
  const remove = useWatchlistStore((s) => s.remove)

  const { data: genresData } = useQuery(movieQueries.genres())

  const genreMap = useMemo(() => {
    const map = new Map<number, string>()
    if (genresData?.genres) {
      for (const g of genresData.genres) {
        map.set(g.id, g.name)
      }
    }
    return map
  }, [genresData])

  const resolveGenres = useMemo(() => {
    return (genreIds: number[]) => {
      if (!genreIds.length) return 'Sem gênero'
      const names = genreIds.map((id) => genreMap.get(id)).filter(Boolean)
      return names.length > 0 ? names.join(', ') : 'Sem gênero'
    }
  }, [genreMap])

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Título',
        sortingFn: (rowA, rowB) =>
          rowA.original.title.localeCompare(rowB.original.title, 'pt-BR'),
      }),
      columnHelper.accessor(
        (row) => resolveGenres(row.genre_ids),
        {
          id: 'genre',
          header: 'Gênero',
          sortingFn: (rowA, rowB, columnId) => {
            const a = rowA.getValue<string>(columnId)
            const b = rowB.getValue<string>(columnId)
            return a.localeCompare(b, 'pt-BR')
          },
        },
      ),
      columnHelper.accessor('release_date', {
        header: 'Data de Lançamento',
        cell: ({ getValue }) => {
          const val = getValue()
          if (!val) return '—'
          return new Intl.DateTimeFormat('pt-BR').format(new Date(val))
        },
        enableSorting: false,
      }),
      columnHelper.accessor('vote_average', {
        header: 'Rating',
        cell: ({ getValue }) => getValue().toFixed(1),
        sortingFn: 'basic',
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Ações',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="xs" asChild>
              <Link
                to="/movie/$movieId"
                params={{ movieId: String(row.original.id) }}
              >
                <Eye className="size-3.5" />
                Detalhes
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => remove(row.original.id)}
            >
              <Trash2 className="size-3.5" />
              Remover
            </Button>
          </div>
        ),
        enableSorting: false,
      }),
    ],
    [resolveGenres],
  )

  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left font-medium text-muted-foreground"
                >
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 hover:text-foreground"
                      onClick={() => header.column.toggleSorting()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      <SortIcon
                        sorted={header.column.getIsSorted()}
                      />
                    </button>
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="transition-colors hover:bg-muted/30"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
