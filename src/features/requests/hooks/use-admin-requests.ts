import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { RequestStatus } from '../types/request.types'
import { requestKeys } from './use-requests'

export function useAdminRequests(statusFilter?: RequestStatus, userId?: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('requests-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests' },
        () => {
          queryClient.invalidateQueries({ queryKey: requestKeys.all })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return useQuery({
    queryKey: [...requestKeys.admin(statusFilter), userId ?? 'all-users'],
    queryFn: async () => {
      let query = supabase
        .from('requests')
        .select('*, profiles(display_name, avatar_url)')
        .order('created_at', { ascending: false })

      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
  })
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      requestId,
      status,
      adminNote,
    }: {
      requestId: string
      status: RequestStatus
      adminNote?: string
    }) => {
      const { data, error } = await supabase
        .from('requests')
        .update({
          status,
          admin_note: adminNote ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
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
