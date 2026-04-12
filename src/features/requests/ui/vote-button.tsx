import { ThumbsUp } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { useRequestVotes, useToggleVote } from '../hooks/use-request-votes'

interface VoteButtonProps {
  requestId: string
}

export function VoteButton({ requestId }: VoteButtonProps) {
  const { data } = useRequestVotes(requestId)
  const toggle = useToggleVote()

  if (!data) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      className={data.hasVoted ? 'text-blue-500' : 'text-muted-foreground'}
      onClick={() => toggle.mutate({ requestId, hasVoted: data.hasVoted })}
      disabled={toggle.isPending}
    >
      <ThumbsUp className="size-4" />
      {data.count > 0 && data.count}
    </Button>
  )
}
