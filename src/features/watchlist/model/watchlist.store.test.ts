import { describe, it, expect, beforeEach } from 'vitest'
import { useWatchlistStore } from './watchlist.store'
import type { Movie } from '@/entities/movie'

const movieA: Movie = {
  id: 1,
  title: 'Movie A',
  overview: '',
  poster_path: null,
  backdrop_path: null,
  release_date: '2024-01-01',
  vote_average: 7.5,
  vote_count: 100,
  genre_ids: [28],
  popularity: 50,
  original_language: 'en',
}

const movieB: Movie = {
  id: 2,
  title: 'Movie B',
  overview: '',
  poster_path: null,
  backdrop_path: null,
  release_date: '2023-06-15',
  vote_average: 8.2,
  vote_count: 200,
  genre_ids: [12, 35],
  popularity: 80,
  original_language: 'en',
}

describe('useWatchlistStore', () => {
  beforeEach(() => {
    useWatchlistStore.setState({ items: [] })
  })

  it('inicia com lista vazia', () => {
    expect(useWatchlistStore.getState().items).toEqual([])
  })

  it('adiciona filme à lista', () => {
    useWatchlistStore.getState().add(movieA)
    expect(useWatchlistStore.getState().items).toHaveLength(1)
    expect(useWatchlistStore.getState().items[0].id).toBe(movieA.id)
  })

  it('não duplica filme ao adicionar duas vezes', () => {
    useWatchlistStore.getState().add(movieA)
    useWatchlistStore.getState().add(movieA)
    expect(useWatchlistStore.getState().items).toHaveLength(1)
  })

  it('remove filme por id', () => {
    useWatchlistStore.getState().add(movieA)
    useWatchlistStore.getState().add(movieB)
    useWatchlistStore.getState().remove(movieA.id)

    const { items } = useWatchlistStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].id).toBe(movieB.id)
  })

  it('remove de lista vazia sem erro', () => {
    useWatchlistStore.getState().remove(999)
    expect(useWatchlistStore.getState().items).toEqual([])
  })

  it('toggle adiciona filme quando não existe', () => {
    useWatchlistStore.getState().toggle(movieA)
    expect(useWatchlistStore.getState().has(movieA.id)).toBe(true)
  })

  it('toggle remove filme quando já existe', () => {
    useWatchlistStore.getState().add(movieA)
    useWatchlistStore.getState().toggle(movieA)
    expect(useWatchlistStore.getState().has(movieA.id)).toBe(false)
  })

  it('has retorna false para filme ausente', () => {
    expect(useWatchlistStore.getState().has(999)).toBe(false)
  })

  it('has retorna true para filme presente', () => {
    useWatchlistStore.getState().add(movieA)
    expect(useWatchlistStore.getState().has(movieA.id)).toBe(true)
  })

  it('clear remove todos os filmes', () => {
    useWatchlistStore.getState().add(movieA)
    useWatchlistStore.getState().add(movieB)
    useWatchlistStore.getState().clear()
    expect(useWatchlistStore.getState().items).toEqual([])
  })
})
