import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { userStorage } from '@/shared/lib/storage/user-storage'
import type { ThemeMode } from './theme.types'

interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggle: () => void
}

export function resolveEffectiveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return mode
}

export function applyThemeToDOM(mode: ThemeMode) {
  const effective = resolveEffectiveTheme(mode)
  document.documentElement.classList.toggle('dark', effective === 'dark')
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',

      setMode: (mode) => {
        set({ mode })
        applyThemeToDOM(mode)
      },

      toggle: () => {
        const current = resolveEffectiveTheme(get().mode)
        const next: ThemeMode = current === 'dark' ? 'light' : 'dark'
        set({ mode: next })
        applyThemeToDOM(next)
      },
    }),
    {
      name: 'cinedash.ui.theme',
      storage: createJSONStorage(() => userStorage),
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeToDOM(state.mode)
      },
    },
  ),
)
