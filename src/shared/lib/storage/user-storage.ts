import type { StateStorage } from 'zustand/middleware'
import { getCurrentUserId } from './current-user'

function getLS(): Storage | undefined {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

export function userKey(name: string): string | null {
  const userId = getCurrentUserId()
  return userId ? `${name}::${userId}` : null
}

export const userStorage: StateStorage = {
  getItem(name) {
    const key = userKey(name)
    return key ? getLS()?.getItem(key) ?? null : null
  },
  setItem(name, value) {
    const key = userKey(name)
    if (key) getLS()?.setItem(key, value)
  },
  removeItem(name) {
    const key = userKey(name)
    if (key) getLS()?.removeItem(key)
  },
}
