import { useState, useCallback, useRef } from "react";
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

  const starsRef = useRef<HTMLDivElement>(null);
  const title = movie.name ?? movie.title;
  const mediaType = movie.media_type ?? "movie";
  const displayRating = hoverRating || rating;

  const getValueFromTouch = useCallback((clientX: number) => {
    if (!starsRef.current) return 0;
    const rect = starsRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const starWidth = rect.width / 5;
    const starIndex = Math.floor(x / starWidth);
    const withinStar = x - starIndex * starWidth;
    const isLeftHalf = withinStar < starWidth / 2;
    return Math.max(0.5, Math.min(5, starIndex + (isLeftHalf ? 0.5 : 1)));
  }, []);

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
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
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
              ref={starsRef}
              className="flex gap-0.5 mt-2 touch-none"
              onMouseLeave={() => setHoverRating(0)}
              onTouchMove={(e) => setHoverRating(getValueFromTouch(e.touches[0].clientX))}
              onTouchEnd={() => {
                if (hoverRating > 0) {
                  setRating(hoverRating === rating ? 0 : hoverRating);
                  setHoverRating(0);
                }
              }}
            >
              {[1, 2, 3, 4, 5].map((v) => {
                const getVal = (e: React.MouseEvent) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  return e.clientX - rect.left < rect.width / 2 ? v - 0.5 : v;
                };
                return (
                  <button
                    key={v}
                    type="button"
                    onMouseMove={(e) => setHoverRating(getVal(e))}
                    onClick={(e) => {
                      const val = getVal(e);
                      setRating(val === rating ? 0 : val);
                    }}
                  >
                    <div className="relative">
                      <Star className="size-5 text-muted-foreground/30" />
                      {displayRating >= v - 0.5 && (
                        <div
                          className="absolute inset-0 overflow-hidden"
                          style={{
                            width: displayRating >= v ? "100%" : "50%",
                          }}
                        >
                          <Star className="size-5 fill-yellow-400 text-yellow-400" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
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
