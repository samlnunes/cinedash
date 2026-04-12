import { ThumbsUp } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { useRequestVotes, useToggleVote } from "../hooks/use-request-votes";

interface VoteButtonProps {
  requestId: string;
}

export function VoteButton({ requestId }: VoteButtonProps) {
  const { data } = useRequestVotes(requestId);
  const toggle = useToggleVote();

  if (!data) return null;

  return (
    <div className="flex flex-col items-end gap-0.5">
      <Button
        variant="ghost"
        size="sm"
        className={data.hasVoted ? "text-blue-500" : "text-muted-foreground"}
        onClick={() => toggle.mutate({ requestId, hasVoted: data.hasVoted })}
        disabled={toggle.isPending}
      >
        <ThumbsUp className="size-4" />
        {data.count > 0 && data.count}
      </Button>
      {data.count > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <button className="text-[10px] text-muted-foreground hover:underline pr-1">
              ver votos
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-xs">
            <DialogHeader>
              <DialogTitle>Votos</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {data.users.map((u) => (
                <div key={u.user_id} className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarImage src={u.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {u.display_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{u.display_name}</span>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
