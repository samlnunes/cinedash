import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth'

const feedKeys = {
  all: ['feed'] as const,
  comments: (postId: string) => ['feed', 'comments', postId] as const,
  profiles: ['profiles', 'all'] as const,
}

export function useFeed() {
  return useInfiniteQuery({
    queryKey: feedKeys.all,
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(display_name, avatar_url)')
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + 19)

      if (error) throw error
      return data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.length === 20 ? lastPageParam + 20 : undefined,
    staleTime: 1000 * 30,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async (post: {
      tmdbId: number
      mediaType: string
      title: string
      posterPath: string | null
      rating: number | null
      body: string
      spoiler?: boolean
      mentionedUserIds?: string[]
    }) => {
      const { error } = await supabase.from('posts').insert({
        user_id: userId!,
        tmdb_id: post.tmdbId,
        media_type: post.mediaType,
        title: post.title,
        poster_path: post.posterPath,
        rating: post.rating,
        body: post.body || null,
        spoiler: post.spoiler ?? false,
      })
      if (error) throw error

      if (post.mentionedUserIds?.length) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', userId!)
          .single()

        const notifications = post.mentionedUserIds
          .filter((id) => id !== userId)
          .map((id) => ({
            user_id: id,
            title: `${profile?.display_name ?? 'Alguém'} mencionou você em um post sobre ${post.title}`,
            body: post.body ? (post.body.length > 100 ? post.body.slice(0, 100) + '...' : post.body) : null,
            link: '/feed',
            read: false,
          }))

        if (notifications.length > 0) {
          await supabase.from('notifications').insert(notifications)
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.all })
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from('posts').delete().eq('id', postId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.all })
    },
  })
}

export function useComments(postId: string) {
  return useQuery({
    queryKey: feedKeys.comments(postId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_comments')
        .select('*, profiles(display_name, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data
    },
    staleTime: 1000 * 15,
  })
}

export function useAllProfiles() {
  return useQuery({
    queryKey: feedKeys.profiles,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .order('display_name', { ascending: true })

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async ({ postId, body, parentId, mentionedUserIds }: {
      postId: string
      body: string
      parentId?: string
      mentionedUserIds?: string[]
    }) => {
      const { error } = await supabase.from('post_comments').insert({
        post_id: postId,
        user_id: userId!,
        body,
        parent_id: parentId ?? null,
      })
      if (error) throw error

      // Create notifications for mentioned users
      if (mentionedUserIds?.length) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', userId!)
          .single()

        const notifications = mentionedUserIds
          .filter((id) => id !== userId)
          .map((id) => ({
            user_id: id,
            title: `${profile?.display_name ?? 'Alguém'} mencionou você em um comentário`,
            body: body.length > 100 ? body.slice(0, 100) + '...' : body,
            link: '/feed',
            read: false,
          }))

        if (notifications.length > 0) {
          await supabase.from('notifications').insert(notifications)
        }
      }
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: feedKeys.comments(postId) })
    },
  })
}

export function usePostLikes(postId: string) {
  const userId = useAuthStore((s) => s.user?.id)

  return useQuery({
    queryKey: ['feed', 'likes', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_likes')
        .select('user_id, profiles(display_name, avatar_url)')
        .eq('post_id', postId)

      if (error) throw error
      return {
        count: data.length,
        hasLiked: data.some((l) => l.user_id === userId),
        users: data.map((l) => ({
          user_id: l.user_id,
          display_name: (l.profiles as any)?.display_name ?? 'Usuário',
          avatar_url: (l.profiles as any)?.avatar_url ?? null,
        })),
      }
    },
    enabled: !!userId,
  })
}

export function useTogglePostLike() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async ({ postId, hasLiked }: { postId: string; hasLiked: boolean }) => {
      if (hasLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId!)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: userId! })
        if (error) throw error
      }
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['feed', 'likes', postId] })
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ commentId, postId }: { commentId: string; postId: string }) => {
      const { error } = await supabase.from('post_comments').delete().eq('id', commentId)
      if (error) throw error
      return postId
    },
    onSuccess: (postId) => {
      queryClient.invalidateQueries({ queryKey: feedKeys.comments(postId) })
    },
  })
}
