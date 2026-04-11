import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const MIGRATION_KEY = 'cinedash.supabase_migrated'

/**
 * One-time migration of localStorage watchlist data to Supabase.
 * Runs once per user (tracked by localStorage flag).
 */
export function useMigrateLocalStorage(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return
    if (localStorage.getItem(MIGRATION_KEY)) return

    const oldKeys = Object.keys(localStorage).filter((k) =>
      k.startsWith('cinedash.watchlist::'),
    )

    if (oldKeys.length === 0) {
      localStorage.setItem(MIGRATION_KEY, 'true')
      return
    }

    async function migrate() {
      for (const key of oldKeys) {
        try {
          const raw = localStorage.getItem(key)
          if (!raw) continue

          const data = JSON.parse(raw)
          const items: any[] = data?.state?.items ?? []

          if (items.length === 0) continue

          const rows = items.map((movie) => ({
            user_id: userId!,
            tmdb_id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path ?? null,
            year: movie.release_date?.slice(0, 4) ?? null,
            vote_average: movie.vote_average ?? null,
          }))

          await supabase
            .from('watchlist')
            .upsert(rows, { onConflict: 'user_id,tmdb_id' })
        } catch {
          // Skip malformed entries
        }
      }

      localStorage.setItem(MIGRATION_KEY, 'true')
    }

    migrate()
  }, [userId])
}
