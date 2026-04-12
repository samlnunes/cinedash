import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Star, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { posterUrl, tmdbFetch } from "@/shared/api/tmdb/client";
import { useAuthStore } from "@/features/auth";
import {
  useComments,
  useAddComment,
  useDeleteComment,
  useDeletePost,
  usePostLikes,
  useTogglePostLike,
} from "../hooks/use-feed";
import { ShareStoryButton } from "./share-story";

interface PostCardProps {
  post: {
    id: string;
    user_id: string;
    tmdb_id: number;
    media_type: string;
    title: string;
    poster_path: string | null;
    rating: number | null;
    body: string | null;
    spoiler?: boolean;
    created_at: string;
    profiles: { display_name: string; avatar_url: string | null } | null;
  };
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const hasSpoiler = post.spoiler && !spoilerRevealed;
  const { data: comments } = useComments(post.id);
  const { data: likes } = usePostLikes(post.id);
  const toggleLike = useTogglePostLike();
  const deletePost = useDeletePost();
  const userId = useAuthStore((s) => s.user?.id);
  const navigate = useNavigate();
  const isOwner = userId === post.user_id;
  const profile = post.profiles;

  const initials = (profile?.display_name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE;
  const endpoint =
    post.media_type === "tv" ? `/tv/${post.tmdb_id}` : `/movie/${post.tmdb_id}`;
  const { data: tmdbDetail, isLoading: backdropLoading } = useQuery({
    queryKey: ["feed-backdrop", post.tmdb_id],
    queryFn: () =>
      tmdbFetch<{ backdrop_path: string | null }>(endpoint, {
        language: "pt-BR",
      }),
    staleTime: 1000 * 60 * 60,
  });
  const backdropUrl = tmdbDetail?.backdrop_path
    ? `${IMAGE_BASE}/w780${tmdbDetail.backdrop_path}`
    : null;

  const goToDetails = () => {
    if (post.media_type === "tv") {
      navigate({ to: "/tv/$tvId", params: { tvId: String(post.tmdb_id) } });
    } else {
      navigate({
        to: "/movie/$movieId",
        params: { movieId: String(post.tmdb_id) },
      });
    }
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Movie */}
      <div className="relative cursor-pointer" onClick={goToDetails}>
        {backdropLoading ? (
          <div className="w-full aspect-video animate-pulse bg-muted" />
        ) : (
          <img
            src={backdropUrl ?? posterUrl(post.poster_path, "w500")}
            alt={post.title}
            className={`w-full object-cover ${backdropUrl ? "aspect-video" : "max-h-80 object-contain bg-black/50"}`}
          />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-16">
          <p className="text-lg font-bold text-white line-clamp-2">
            {post.title}
          </p>
          {post.rating && (
            <div className="flex items-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((v) => (
                <Star
                  key={v}
                  className={`size-4 ${v <= post.rating! ? "fill-yellow-400 text-yellow-400" : "text-white/30"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Header + Comment */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium">{profile?.display_name}</span>
              <span className="text-muted-foreground ml-1.5">
                {formatRelative(post.created_at)}
              </span>
            </p>
          </div>
          {isOwner && (
            <Button
              variant="ghost"
              size="xs"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => deletePost.mutate(post.id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>

        {post.body &&
          (hasSpoiler ? (
            <button
              onClick={() => setSpoilerRevealed(true)}
              className="relative w-full rounded-md bg-muted/50 px-3 py-2 text-left"
            >
              <p className="text-xs text-destructive font-medium">
                Contém spoiler — toque para revelar
              </p>
            </button>
          ) : (
            <ExpandableText text={post.body} />
          ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 pb-2">
        <Button
          variant="ghost"
          size="xs"
          className={likes?.hasLiked ? "text-red-500" : "text-muted-foreground"}
          onClick={() =>
            likes &&
            toggleLike.mutate({ postId: post.id, hasLiked: likes.hasLiked })
          }
          disabled={toggleLike.isPending}
        >
          <Heart
            className={`size-3.5 ${likes?.hasLiked ? "fill-red-500" : ""}`}
          />
          {likes?.count || 0}
        </Button>
        <Button
          variant="ghost"
          size="xs"
          className="text-muted-foreground"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="size-3.5" />
          {comments?.length || 0}
        </Button>
        <ShareStoryButton
          title={post.title}
          posterPath={post.poster_path}
          rating={post.rating}
          body={post.body}
          userName={profile?.display_name ?? ""}
          avatarUrl={profile?.avatar_url ?? null}
        />
      </div>

      {/* Comments */}
      {showComments && (
        <CommentsSection postId={post.id} comments={comments as any} />
      )}
    </div>
  );
}

function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 200;

  return (
    <div className="text-sm leading-relaxed">
      <p className={!expanded && isLong ? "line-clamp-4" : ""}>{text}</p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-medium text-muted-foreground hover:text-foreground mt-1"
        >
          {expanded ? "ver menos" : "ver mais"}
        </button>
      )}
    </div>
  );
}

interface CommentData {
  id: string;
  user_id: string;
  body: string;
  parent_id?: string | null;
  created_at: string;
  profiles: { display_name: string; avatar_url: string | null } | null;
}

function CommentsSection({
  postId,
  comments,
}: {
  postId: string;
  comments: CommentData[] | undefined;
}) {
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(
    null,
  );
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const userId = useAuthStore((s) => s.user?.id);

  const handleSubmit = () => {
    if (!text.trim()) return;
    addComment.mutate({ postId, body: text.trim(), parentId: replyTo?.id });
    setText("");
    setReplyTo(null);
  };

  const topLevel = comments?.filter((c) => !c.parent_id) ?? [];
  const repliesMap = new Map<string, CommentData[]>();
  for (const c of comments ?? []) {
    if (c.parent_id) {
      const list = repliesMap.get(c.parent_id) ?? [];
      list.push(c);
      repliesMap.set(c.parent_id, list);
    }
  }

  const renderComment = (comment: CommentData, indent: boolean) => {
    const profile = comment.profiles;
    const initials = (profile?.display_name ?? "?")[0].toUpperCase();
    const isOwner = userId === comment.user_id;

    return (
      <div key={comment.id} className={`flex gap-2 ${indent ? "ml-8" : ""}`}>
        <Avatar className="size-6 shrink-0">
          <AvatarImage src={profile?.avatar_url ?? undefined} />
          <AvatarFallback className="text-[9px]">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-xs">
            <span className="font-medium">{profile?.display_name}</span>
            <span className="text-muted-foreground ml-1.5">
              {formatRelative(comment.created_at)}
            </span>
          </p>
          <ExpandableText text={comment.body} />
          <div className="flex gap-2 mt-0.5">
            <button
              onClick={() =>
                setReplyTo({
                  id: comment.id,
                  name: profile?.display_name ?? "",
                })
              }
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              Responder
            </button>
            {isOwner && (
              <button
                onClick={() =>
                  deleteComment.mutate({ commentId: comment.id, postId })
                }
                className="text-[11px] text-muted-foreground hover:text-destructive"
              >
                Excluir
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border-t px-4 py-3 space-y-3">
      {topLevel.map((comment) => (
        <div key={comment.id} className="space-y-2">
          {renderComment(comment, false)}
          {repliesMap
            .get(comment.id)
            ?.map((reply) => renderComment(reply, true))}
        </div>
      ))}

      {replyTo && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>
            Respondendo a <strong>{replyTo.name}</strong>
          </span>
          <button
            onClick={() => setReplyTo(null)}
            className="hover:text-foreground ml-1"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          placeholder={
            replyTo ? `Responder ${replyTo.name}...` : "Escrever comentário..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          onFocus={(e) =>
            setTimeout(
              () =>
                e.target.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                }),
              300,
            )
          }
          className="h-9 text-base sm:text-sm"
        />
        <Button
          size="sm"
          className="h-9"
          onClick={handleSubmit}
          disabled={!text.trim() || addComment.isPending}
        >
          Enviar
        </Button>
      </div>
    </div>
  );
}
