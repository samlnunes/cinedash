import { describe, it, expect, beforeEach } from 'vitest'
import { useDiscoveryStore } from './discovery.store'

describe('useDiscoveryStore', () => {
  beforeEach(() => {
    useDiscoveryStore.setState({
      tab: 'trending',
      query: '',
      page: 1,
      filters: {},
    })
  })

  it('inicia com estado padrão', () => {
    const state = useDiscoveryStore.getState()
    expect(state.tab).toBe('trending')
    expect(state.query).toBe('')
    expect(state.page).toBe(1)
    expect(state.filters).toEqual({})
  })

  it('reseta a página ao trocar de aba', () => {
    useDiscoveryStore.getState().setPage(3)
    useDiscoveryStore.getState().setTab('popular')

    const state = useDiscoveryStore.getState()
    expect(state.tab).toBe('popular')
    expect(state.page).toBe(1)
  })

  it('reseta a página ao alterar a query', () => {
    useDiscoveryStore.getState().setPage(5)
    useDiscoveryStore.getState().setQuery('batman')

    const state = useDiscoveryStore.getState()
    expect(state.query).toBe('batman')
    expect(state.page).toBe(1)
  })

  it('reseta a página ao alterar filtros', () => {
    useDiscoveryStore.getState().setPage(4)
    useDiscoveryStore.getState().setFilters({ genreId: 28 })

    const state = useDiscoveryStore.getState()
    expect(state.filters.genreId).toBe(28)
    expect(state.page).toBe(1)
  })

  it('mescla filtros parciais sem sobrescrever', () => {
    useDiscoveryStore.getState().setFilters({ genreId: 28 })
    useDiscoveryStore.getState().setFilters({ year: 2024 })

    const { filters } = useDiscoveryStore.getState()
    expect(filters.genreId).toBe(28)
    expect(filters.year).toBe(2024)
  })

  it('limpa todos os filtros ao resetar', () => {
    useDiscoveryStore.getState().setFilters({ genreId: 28, year: 2024, minRating: 7 })
    useDiscoveryStore.getState().setPage(3)
    useDiscoveryStore.getState().resetFilters()

    const state = useDiscoveryStore.getState()
    expect(state.filters).toEqual({})
    expect(state.page).toBe(1)
  })

  it('permite navegar páginas diretamente', () => {
    useDiscoveryStore.getState().setPage(10)
    expect(useDiscoveryStore.getState().page).toBe(10)
  })
})
