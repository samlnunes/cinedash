import { useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { Checkbox } from "@/shared/ui/checkbox";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { posterUrl } from "@/shared/api/tmdb/client";
import { useCreatePost } from "../hooks/use-feed";
import { MentionTextarea } from "./mention-input";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movie: {
    id: number;
    title: string;
    name?: string;
    poster_path: string | null;
    media_type?: string;
  };
}

export function CreatePostModal({
  open,
  onOpenChange,
  movie,
}: CreatePostModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [body, setBody] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [mentionedIds, setMentionedIds] = useState<Set<string>>(new Set());
  const createPost = useCreatePost();
  const navigate = useNavigate();

  const handleMention = useCallback((id: string) => {
    setMentionedIds((prev) => new Set(prev).add(id));
  }, []);

  const title = movie.name ?? movie.title;
  const mediaType = movie.media_type ?? "movie";
  const displayRating = hoverRating || rating;

  const handleSubmit = () => {
    createPost.mutate(
      {
        tmdbId: movie.id,
        mediaType,
        title,
        posterPath: movie.poster_path,
        rating: rating || null,
        body: body.trim(),
        spoiler,
        mentionedUserIds: [...mentionedIds],
      },
      {
        onSuccess: () => {
          setRating(0);
          setBody("");
          setSpoiler(false);
          setMentionedIds(new Set());
          onOpenChange(false);
          navigate({ to: "/feed" });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Compartilhar no feed</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3">
          <img
            src={posterUrl(movie.poster_path, "w185")}
            alt={title}
            className="h-24 w-16 rounded object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="font-medium line-clamp-2">{title}</p>
            <div
              className="flex gap-0.5 mt-2"
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  onMouseEnter={() => setHoverRating(v)}
                  onClick={() => setRating(v === rating ? 0 : v)}
                >
                  <Star
                    className={`size-5 transition-colors ${
                      v <= displayRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <MentionTextarea
          placeholder="O que achou do filme? (opcional)"
          value={body}
          onChange={setBody}
          onMention={handleMention}
          rows={3}
        />

        <div className="flex items-center gap-2">
          <Checkbox
            id="spoiler"
            checked={spoiler}
            onCheckedChange={(v) => setSpoiler(v === true)}
          />
          <label
            htmlFor="spoiler"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Contém spoiler
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={createPost.isPending}>
            {createPost.isPending ? "Publicando..." : "Publicar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
