// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useThemeStore, resolveEffectiveTheme, applyThemeToDOM } from './theme.store'

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ mode: 'system' })
    document.documentElement.classList.remove('dark')
  })

  it('inicia com mode "system"', () => {
    expect(useThemeStore.getState().mode).toBe('system')
  })

  it('setMode atualiza para "dark"', () => {
    useThemeStore.getState().setMode('dark')
    expect(useThemeStore.getState().mode).toBe('dark')
  })

  it('setMode atualiza para "light"', () => {
    useThemeStore.getState().setMode('dark')
    useThemeStore.getState().setMode('light')
    expect(useThemeStore.getState().mode).toBe('light')
  })

  it('setMode aplica classe dark no DOM', () => {
    useThemeStore.getState().setMode('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    useThemeStore.getState().setMode('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('toggle alterna de light para dark', () => {
    useThemeStore.setState({ mode: 'light' })
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().mode).toBe('dark')
  })

  it('toggle alterna de dark para light', () => {
    useThemeStore.setState({ mode: 'dark' })
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().mode).toBe('light')
  })
})

describe('resolveEffectiveTheme', () => {
  it('retorna "dark" para mode dark', () => {
    expect(resolveEffectiveTheme('dark')).toBe('dark')
  })

  it('retorna "light" para mode light', () => {
    expect(resolveEffectiveTheme('light')).toBe('light')
  })

  it('retorna dark quando sistema prefere dark', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true })
    expect(resolveEffectiveTheme('system')).toBe('dark')
  })

  it('retorna light quando sistema prefere light', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false })
    expect(resolveEffectiveTheme('system')).toBe('light')
  })
})

describe('applyThemeToDOM', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
  })

  it('adiciona classe dark para mode dark', () => {
    applyThemeToDOM('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('remove classe dark para mode light', () => {
    document.documentElement.classList.add('dark')
    applyThemeToDOM('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
