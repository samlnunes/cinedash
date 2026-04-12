import { useNavigate } from '@tanstack/react-router'
import { posterUrl } from '@/shared/api/tmdb/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { VoteButton } from './vote-button'

interface Profile {
  display_name: string
  avatar_url: string | null
}

interface CommunityRequest {
  id: string
  tmdb_id: number
  title: string
  poster_path: string | null
  year: string | null
  note: string | null
  created_at: string
  profiles: Profile | null
}

export interface GroupedCommunityRequest {
  tmdb_id: number
  title: string
  poster_path: string | null
  year: string | null
  requestIds: string[]
  profiles: Profile[]
  notes: string[]
}

export function groupCommunityRequests(requests: CommunityRequest[]): GroupedCommunityRequest[] {
  const map = new Map<number, GroupedCommunityRequest>()

  for (const r of requests) {
    const existing = map.get(r.tmdb_id)
    if (existing) {
      existing.requestIds.push(r.id)
      if (r.profiles) existing.profiles.push(r.profiles)
      if (r.note) existing.notes.push(r.note)
    } else {
      map.set(r.tmdb_id, {
        tmdb_id: r.tmdb_id,
        title: r.title,
        poster_path: r.poster_path,
        year: r.year,
        requestIds: [r.id],
        profiles: r.profiles ? [r.profiles] : [],
        notes: r.note ? [r.note] : [],
      })
    }
  }

  return Array.from(map.values())
}

export function CommunityRequestCard({ group }: { group: GroupedCommunityRequest }) {
  const navigate = useNavigate()

  const goToDetails = () => {
    navigate({ to: '/movie/$movieId', params: { movieId: String(group.tmdb_id) } })
  }

  return (
    <div
      className="flex gap-4 rounded-lg border bg-card p-4 cursor-pointer transition-colors hover:bg-accent/50 overflow-hidden"
      onClick={(e) => {
        const target = e.target as HTMLElement
        if (target.closest('[data-no-navigate]') || !e.currentTarget.contains(target)) return
        goToDetails()
      }}
    >
      <img
        src={posterUrl(group.poster_path, 'w185')}
        alt={group.title}
        className="h-28 w-20 rounded object-cover shrink-0"
      />
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <p className="text-sm font-medium line-clamp-2">{group.title}</p>
        {group.year && (
          <p className="text-sm text-muted-foreground">{group.year}</p>
        )}
        {group.notes.length > 0 && (
          <p className="text-sm text-muted-foreground mt-1 truncate">
            {group.notes[0]}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto" data-no-navigate>
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1.5">
              {group.profiles.slice(0, 5).map((p, i) => (
                <Avatar key={i} className="size-5 ring-2 ring-card">
                  <AvatarImage src={p.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[8px]">
                    {p.display_name[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-1">
              {group.requestIds.length === 1
                ? group.profiles[0]?.display_name
                : `${group.requestIds.length} pedidos`}
            </span>
          </div>
          <VoteButton requestId={group.requestIds[0]} />
        </div>
      </div>
    </div>
  )
}
