// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { userStorage, userKey } from './user-storage'
import { setCurrentUserId } from './current-user'

describe('userStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    setCurrentUserId(null)
  })

  it('returns null when no user is set', () => {
    expect(userKey('cinedash.watchlist')).toBeNull()
  })

  it('is a no-op for setItem when no user is set', () => {
    userStorage.setItem('cinedash.watchlist', '{"items":[]}')
    expect(localStorage.length).toBe(0)
  })

  it('namespaces key by user id', () => {
    setCurrentUserId('user-123')
    expect(userKey('cinedash.watchlist')).toBe(
      'cinedash.watchlist::user-123',
    )
  })

  it('isolates data between different users', () => {
    setCurrentUserId('alice-id')
    userStorage.setItem('cinedash.watchlist', '{"items":["a"]}')

    setCurrentUserId('bob-id')
    userStorage.setItem('cinedash.watchlist', '{"items":["b"]}')

    const bobData = userStorage.getItem('cinedash.watchlist')
    expect(bobData).toBe('{"items":["b"]}')

    setCurrentUserId('alice-id')
    const aliceData = userStorage.getItem('cinedash.watchlist')
    expect(aliceData).toBe('{"items":["a"]}')
  })

  it('returns null for missing data', () => {
    setCurrentUserId('nobody-id')
    expect(userStorage.getItem('cinedash.watchlist')).toBeNull()
  })

  it('removes data for the current user only', () => {
    setCurrentUserId('alice-id')
    userStorage.setItem('cinedash.watchlist', '"alice-data"')

    setCurrentUserId('bob-id')
    userStorage.setItem('cinedash.watchlist', '"bob-data"')

    userStorage.removeItem('cinedash.watchlist')
    expect(userStorage.getItem('cinedash.watchlist')).toBeNull()

    setCurrentUserId('alice-id')
    expect(userStorage.getItem('cinedash.watchlist')).toBe('"alice-data"')
  })
})
