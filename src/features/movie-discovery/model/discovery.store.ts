import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { userStorage } from '@/shared/lib/storage/user-storage'

export type DiscoveryTab = 'trending' | 'popular'

export interface DiscoveryFilters {
  genreId?: number
  year?: number
  minRating?: number
}

interface DiscoveryState {
  tab: DiscoveryTab
  query: string
  page: number
  filters: DiscoveryFilters

  setTab: (tab: DiscoveryTab) => void
  setQuery: (query: string) => void
  setPage: (page: number) => void
  setFilters: (filters: Partial<DiscoveryFilters>) => void
  resetFilters: () => void
}

const EMPTY_FILTERS: DiscoveryFilters = {}

export const useDiscoveryStore = create<DiscoveryState>()(
  persist(
    (set) => ({
      tab: 'trending',
      query: '',
      page: 1,
      filters: EMPTY_FILTERS,

      setTab: (tab) => set({ tab, page: 1 }),
      setQuery: (query) => set({ query, page: 1 }),
      setPage: (page) => set({ page }),
      setFilters: (partial) =>
        set((state) => ({
          filters: { ...state.filters, ...partial },
          page: 1,
        })),
      resetFilters: () => set({ filters: EMPTY_FILTERS, page: 1 }),
    }),
    {
      name: 'cinedash.discovery',
      storage: createJSONStorage(() => userStorage),
    },
  ),
)
