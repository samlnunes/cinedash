import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth'
import type { RequestInsert } from '../types/request.types'

export const requestKeys = {
  all: ['requests'] as const,
  mine: () => [...requestKeys.all, 'mine'] as const,
  admin: (status?: string) => [...requestKeys.all, 'admin', status] as const,
}

export function useMyRequests() {
  const userId = useAuthStore((s) => s.user?.id)

  return useQuery({
    queryKey: requestKeys.mine(),
    queryFn: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('user_id', userId!)
        .or(`status.neq.done,updated_at.gte.${sevenDaysAgo}`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

export function useCreateRequest() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async (
      request: Omit<RequestInsert, 'user_id' | 'id' | 'status' | 'created_at' | 'updated_at'>,
    ) => {
      const { data, error } = await supabase
        .from('requests')
        .insert({ ...request, user_id: userId! })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.all })
    },
  })
}

export function useCancelRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', requestId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.all })
    },
  })
}

export function useHasRequested(tmdbId: number) {
  const { data: requests, ...rest } = useMyRequests()
  const existing = requests?.find((r) => r.tmdb_id === tmdbId) ?? null
  return { data: existing, ...rest }
}
