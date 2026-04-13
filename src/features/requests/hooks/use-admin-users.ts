import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface AdminUser {
  id: string
  display_name: string
  avatar_url: string | null
  role: 'user' | 'admin'
  created_at: string
  request_count: number
}

export function useAdminUsers(enabled = true) {
  return useQuery({
    queryKey: ['admin', 'users'],
    enabled,
    queryFn: async (): Promise<AdminUser[]> => {
      const [profilesRes, requestsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, display_name, avatar_url, role, created_at')
          .order('created_at', { ascending: true }),
        supabase.from('requests').select('user_id'),
      ])

      if (profilesRes.error) throw profilesRes.error
      if (requestsRes.error) throw requestsRes.error

      const counts = new Map<string, number>()
      for (const r of requestsRes.data ?? []) {
        counts.set(r.user_id, (counts.get(r.user_id) ?? 0) + 1)
      }

      return (profilesRes.data ?? []).map((p) => ({
        id: p.id,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        role: p.role,
        created_at: p.created_at,
        request_count: counts.get(p.id) ?? 0,
      }))
    },
  })
}
