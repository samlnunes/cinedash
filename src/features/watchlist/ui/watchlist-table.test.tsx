// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createRouter,
  createRootRoute,
  createMemoryHistory,
  RouterProvider,
} from '@tanstack/react-router'
import type { Movie, Genre } from '@/entities/movie'
import { useWatchlistStore } from '../model/watchlist.store'
import { WatchlistTable } from './watchlist-table'

const genres: Genre[] = [
  { id: 28, name: 'Ação' },
  { id: 12, name: 'Aventura' },
  { id: 35, name: 'Comédia' },
]

const movieA: Movie = {
  id: 1,
  title: 'Alpha',
  overview: '',
  poster_path: null,
  backdrop_path: null,
  release_date: '2024-03-10',
  vote_average: 6.0,
  vote_count: 100,
  genre_ids: [28],
  popularity: 50,
  original_language: 'en',
}

const movieB: Movie = {
  id: 2,
  title: 'Beta',
  overview: '',
  poster_path: null,
  backdrop_path: null,
  release_date: '2023-06-15',
  vote_average: 8.5,
  vote_count: 200,
  genre_ids: [35],
  popularity: 80,
  original_language: 'en',
}

const movieC: Movie = {
  id: 3,
  title: 'Charlie',
  overview: '',
  poster_path: null,
  backdrop_path: null,
  release_date: '2025-01-01',
  vote_average: 7.2,
  vote_count: 150,
  genre_ids: [12],
  popularity: 60,
  original_language: 'en',
}

function createQueryClient() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  qc.setQueryData(['movies', 'genres'], { genres })
  return qc
}

function createTestRouter() {
  const rootRoute = createRootRoute({ component: WatchlistTable })
  return createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
}

function renderTable() {
  const qc = createQueryClient()
  const router = createTestRouter()
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

function getBodyRows() {
  const tbody = screen.getAllByRole('rowgroup')[1]
  return within(tbody).getAllByRole('row')
}

function getCellTexts(rows: HTMLElement[], colIndex: number) {
  return rows.map((row) => within(row).getAllByRole('cell')[colIndex].textContent)
}

function clickSortHeader(colIndex: number) {
  const thead = screen.getAllByRole('rowgroup')[0]
  const headers = within(thead).getAllByRole('columnheader')
  const btn = within(headers[colIndex]).queryByRole('button')
  if (!btn) throw new Error(`Sort button not found in column ${colIndex}`)
  fireEvent.click(btn)
}

describe('WatchlistTable', () => {
  beforeEach(() => {
    localStorage.clear()
    useWatchlistStore.setState({ items: [movieA, movieB, movieC] })
  })

  it('renderiza todas as colunas obrigatórias', async () => {
    renderTable()

    const headers = await screen.findAllByRole('columnheader')
    const headerTexts = headers.map((h) => h.textContent?.replace(/\s+/g, ' ').trim())

    expect(headerTexts).toContain('Título')
    expect(headerTexts).toContain('Gênero')
    expect(headerTexts).toContain('Data de Lançamento')
    expect(headerTexts).toContain('Rating')
    expect(headerTexts).toContain('Ações')
  })

  it('renderiza os dados dos filmes', () => {
    renderTable()

    const rows = getBodyRows()
    expect(rows).toHaveLength(3)

    const titles = getCellTexts(rows, 0)
    expect(titles).toContain('Alpha')
    expect(titles).toContain('Beta')
    expect(titles).toContain('Charlie')
  })

  it('resolve gêneros corretamente', () => {
    renderTable()

    const rows = getBodyRows()
    const genreTexts = getCellTexts(rows, 1)

    expect(genreTexts).toContain('Ação')
    expect(genreTexts).toContain('Comédia')
    expect(genreTexts).toContain('Aventura')
  })

  it('ordena por Título em ambas as direções ao clicar no header', () => {
    renderTable()

    clickSortHeader(0)
    const afterFirst = getCellTexts(getBodyRows(), 0)

    clickSortHeader(0)
    const afterSecond = getCellTexts(getBodyRows(), 0)

    const results = [afterFirst, afterSecond].sort()
    expect(results).toContainEqual(['Alpha', 'Beta', 'Charlie'])
    expect(results).toContainEqual(['Charlie', 'Beta', 'Alpha'])
  })

  it('ordena por Rating numericamente ao clicar no header', () => {
    renderTable()

    clickSortHeader(3)
    const ratingsAfterFirst = getCellTexts(getBodyRows(), 3)

    clickSortHeader(3)
    const ratingsAfterSecond = getCellTexts(getBodyRows(), 3)

    const sorted = [ratingsAfterFirst, ratingsAfterSecond].sort()
    expect(sorted).toContainEqual(['6.0', '7.2', '8.5'])
    expect(sorted).toContainEqual(['8.5', '7.2', '6.0'])
  })

  it('ordena por Gênero asc ao clicar no header', () => {
    renderTable()
    clickSortHeader(1)

    const genreTexts = getCellTexts(getBodyRows(), 1)
    expect(genreTexts).toEqual(['Ação', 'Aventura', 'Comédia'])
  })
})
