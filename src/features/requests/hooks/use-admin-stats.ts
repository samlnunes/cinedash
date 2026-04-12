import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface AdminStats {
  total: number
  pending: number
  approved: number
  downloading: number
  done: number
  rejected: number
  users: number
  thisMonth: number
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async (): Promise<AdminStats> => {
      const [requestsRes, usersRes, monthRes] = await Promise.all([
        supabase.from('requests').select('status'),
        supabase.from('profiles').select('id'),
        supabase
          .from('requests')
          .select('id')
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      ])

      const requests = requestsRes.data ?? []
      const count = (status: string) => requests.filter((r) => r.status === status).length

      return {
        total: requests.length,
        pending: count('pending'),
        approved: count('approved'),
        downloading: count('downloading'),
        done: count('done'),
        rejected: count('rejected'),
        users: usersRes.data?.length ?? 0,
        thisMonth: monthRes.data?.length ?? 0,
      }
    },
  })
}
