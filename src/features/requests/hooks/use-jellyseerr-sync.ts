import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { requestKeys } from './use-requests'

// Dispara sync silencioso com o Jellyseerr quando o componente monta.
// Cobre a lacuna de transições `approved → downloading` que o webhook não
// detecta (Jellyseerr não emite evento durante Radarr grabs).
// Resultado é propagado via realtime → react-query refetch.
export function useJellyseerrSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        await supabase.functions.invoke('jellyseerr-sync', { body: {} })
        if (!cancelled) {
          queryClient.invalidateQueries({ queryKey: requestKeys.all })
        }
      } catch {
        // silencioso — sync é melhor-esforço, não bloqueia UX
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [queryClient])
}
