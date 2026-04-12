import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './auth.store'

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      session: null,
      profile: null,
      loading: false,
    })
  })

  it('inicia sem sessão', () => {
    const { session } = useAuthStore.getState()
    expect(session).toBeNull()
  })

  it('não está autenticado quando sem sessão', () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)
  })

  it('está autenticado quando há sessão', () => {
    useAuthStore.setState({
      session: { access_token: 'test' } as any,
      user: { id: '123', email: 'user@example.com' } as any,
    })
    expect(useAuthStore.getState().isAuthenticated()).toBe(true)
  })

  it('limpa sessão via setSession(null)', () => {
    useAuthStore.setState({
      session: { access_token: 'test' } as any,
      user: { id: '123' } as any,
      profile: { id: '123', display_name: 'Test', role: 'user' } as any,
    })

    useAuthStore.getState().setSession(null)

    expect(useAuthStore.getState().session).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)
  })

  it('não é admin por padrão', () => {
    expect(useAuthStore.getState().isAdmin()).toBe(false)
  })

  it('é admin quando profile.role é admin', () => {
    useAuthStore.setState({
      profile: { id: '123', display_name: 'Admin', role: 'admin', avatar_url: null, jellyfin_username: null, share_token: null, created_at: '' },
    })
    expect(useAuthStore.getState().isAdmin()).toBe(true)
  })
})
