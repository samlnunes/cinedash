import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { MessageSquare, Search } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useFeed, PostCard } from "@/features/feed";

export function FeedDashboard() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFeed();

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((p) => p) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feed</h1>
        <p className="text-muted-foreground">
          Veja o que a comunidade está assistindo.
        </p>
      </div>

      {/* CTA */}
      <div className="max-w-lg mx-auto rounded-lg border bg-card p-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Assistiu algo? Busque o filme e clique em{" "}
          <strong>Compartilhar</strong>.
        </p>
        <Button variant="outline" size="sm" className="shrink-0" asChild>
          <Link to="/dashboard">
            <Search className="size-4" />
            Buscar
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-4 max-w-lg mx-auto">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-lg border bg-muted"
            />
          ))}
        </div>
      )}

      {!isLoading && posts.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <MessageSquare className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhuma publicação ainda. Seja o primeiro!
          </p>
        </div>
      )}

      {posts.length > 0 && (
        <div className="space-y-4 max-w-lg mx-auto">
          {posts.map((post) => (
            <PostCard key={post.id} post={post as any} />
          ))}
          <div ref={loadMoreRef} className="h-10" />
          {isFetchingNextPage && (
            <div className="h-48 animate-pulse rounded-lg border bg-muted" />
          )}
        </div>
      )}
    </div>
  );
}
