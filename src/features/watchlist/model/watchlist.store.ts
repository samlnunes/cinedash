import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Movie } from '@/entities/movie'
import { userStorage } from '@/shared/lib/storage/user-storage'

interface WatchlistState {
  items: Movie[]
  add: (movie: Movie) => void
  remove: (movieId: number) => void
  toggle: (movie: Movie) => void
  has: (movieId: number) => boolean
  clear: () => void
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (movie) => {
        if (get().items.some((m) => m.id === movie.id)) return
        set((state) => ({ items: [...state.items, movie] }))
      },

      remove: (movieId) => {
        set((state) => ({ items: state.items.filter((m) => m.id !== movieId) }))
      },

      toggle: (movie) => {
        if (get().has(movie.id)) {
          get().remove(movie.id)
        } else {
          get().add(movie)
        }
      },

      has: (movieId) => get().items.some((m) => m.id === movieId),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'cinedash.watchlist',
      storage: createJSONStorage(() => userStorage),
    },
  ),
)
