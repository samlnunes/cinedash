import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth'
import { requestKeys } from './use-requests'

export const voteKeys = {
  all: ['request-votes'] as const,
  byRequest: (requestId: string) => [...voteKeys.all, requestId] as const,
}

interface VoteData {
  count: number
  hasVoted: boolean
}

export function useRequestVotes(requestId: string) {
  const userId = useAuthStore((s) => s.user?.id)

  return useQuery({
    queryKey: voteKeys.byRequest(requestId),
    queryFn: async (): Promise<VoteData> => {
      const { data, error } = await supabase
        .from('request_votes')
        .select('user_id')
        .eq('request_id', requestId)

      if (error) throw error

      return {
        count: data.length,
        hasVoted: data.some((v) => v.user_id === userId),
      }
    },
    enabled: !!userId,
  })
}

export function useToggleVote() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async ({ requestId, hasVoted }: { requestId: string; hasVoted: boolean }) => {
      if (hasVoted) {
        const { error } = await supabase
          .from('request_votes')
          .delete()
          .eq('request_id', requestId)
          .eq('user_id', userId!)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('request_votes')
          .insert({ request_id: requestId, user_id: userId! })

        if (error) throw error
      }
    },
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: voteKeys.byRequest(requestId) })
      queryClient.invalidateQueries({ queryKey: requestKeys.all })
    },
  })
}
