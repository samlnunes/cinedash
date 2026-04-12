import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  SearchX,
  BookmarkPlus,
  BookmarkMinus,
  MessageSquare,
  Play,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { MovieCard, MovieCardSkeleton, type Movie } from "@/entities/movie";
import {
  DiscoveryTabs,
  DiscoveryFilters,
  useDiscoveryQuery,
} from "@/features/movie-discovery";
import { useIsInWatchlist, useToggleWatchlist } from "@/features/watchlist";
import {
  useJellyfinRecent,
  type RecentJellyfinMovie,
} from "@/features/jellyfin";
import { useRecommendations } from "@/features/recommendations";
import { RequestButton } from "@/features/requests";
import { CreatePostModal } from "@/features/feed";
import { posterUrl } from "@/shared/api/tmdb/client";

const JELLYFIN_URL = import.meta.env.VITE_JELLYFIN_URL;

const SKELETON_COUNT = 12;

export function DiscoveryDashboard() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDiscoveryQuery();
  const { data: recentMovies } = useJellyfinRecent();
  const { data: recommendations } = useRecommendations();

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
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allResults = data?.pages.flatMap((p) => p.results) ?? [];
  const filteredResults = allResults.filter(
    (m: any) => m.media_type !== "person",
  );

  return (
    <div className="space-y-6">
      {recentMovies.length > 0 && <RecentOnServer movies={recentMovies} />}

      {recommendations && recommendations.length > 0 && (
        <RecommendationsRow movies={recommendations} />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard de Descoberta
          </h1>
          <p className="text-muted-foreground">
            Explore filmes em alta e populares.
          </p>
        </div>
        <DiscoveryTabs />
      </div>

      <DiscoveryFilters />

      {isLoading && <MovieGrid skeleton />}

      {isError && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertCircle className="size-10 text-destructive" />
          <p className="text-sm text-muted-foreground">
            {error?.message ?? "Erro ao carregar filmes."}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && filteredResults.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <SearchX className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhum filme encontrado. Tente ajustar seus filtros.
          </p>
        </div>
      )}

      {filteredResults.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredResults.map((movie) => (
              <MovieCard
                key={`${(movie as any).media_type ?? "movie"}-${movie.id}`}
                movie={movie}
                posterOverlay={<SharePostButton movie={movie} />}
                actions={
                  <div className="flex flex-col gap-1">
                    <WatchlistToggle movie={movie} />
                    <RequestButton movie={movie} />
                  </div>
                }
              />
            ))}
          </div>

          <div ref={loadMoreRef} className="h-10" />
          {isFetchingNextPage && <MovieGrid skeleton />}
        </>
      )}
    </div>
  );
}

function WatchlistToggle({ movie }: { movie: Movie }) {
  const { toggle, isPending } = useToggleWatchlist();
  const inList = useIsInWatchlist(movie.id);

  return (
    <Button
      variant={inList ? "outline" : "secondary"}
      size="xs"
      className="w-full"
      onClick={() => toggle(movie)}
      disabled={isPending}
    >
      {inList ? (
        <>
          <BookmarkMinus className="size-3" />
          Remover da minha lista
        </>
      ) : (
        <>
          <BookmarkPlus className="size-3" />
          Adicionar à minha lista
        </>
      )}
    </Button>
  );
}

function SharePostButton({ movie }: { movie: Movie }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        size="icon"
        className="size-8 rounded-full bg-black/60 hover:bg-black/80 text-white"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <MessageSquare className="size-3.5" />
      </Button>
      <CreatePostModal movie={movie} open={open} onOpenChange={setOpen} />
    </>
  );
}

function useCarouselTmdbData(tmdbIds: string[]) {
  return useQuery({
    queryKey: ["carousel-tmdb", ...tmdbIds],
    queryFn: async () => {
      const results = await Promise.all(
        tmdbIds.map(async (id) => {
          const res = await fetch(
            `https://api.themoviedb.org/3/movie/${id}?language=pt-BR`,
            {
              headers: {
                Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_TOKEN}`,
              },
            },
          );
          return res.json();
        }),
      );
      return results as Array<{
        id: number;
        title: string;
        overview: string;
        poster_path: string | null;
        backdrop_path: string | null;
        release_date: string;
        vote_average: number;
        genres: Array<{ id: number; name: string }>;
        runtime: number | null;
      }>;
    },
    staleTime: 1000 * 60 * 30,
    enabled: tmdbIds.length > 0,
  });
}

function RecentOnServer({ movies }: { movies: RecentJellyfinMovie[] }) {
  const [current, setCurrent] = useState(0);
  const tmdbIds = movies.map((m) => m.tmdb_id);
  const { data: tmdbData } = useCarouselTmdbData(tmdbIds);
  const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE;
  const touchStart = useRef(0);

  const movie = movies[current];
  const tmdb = tmdbData?.[current];

  const goTo = useCallback(
    (dir: "prev" | "next") => {
      setCurrent((i) =>
        dir === "next"
          ? (i + 1) % movies.length
          : (i - 1 + movies.length) % movies.length,
      );
    },
    [movies.length],
  );

  // Auto-rotate
  useEffect(() => {
    if (movies.length <= 1) return;
    const timer = setInterval(() => goTo("next"), 6000);
    return () => clearInterval(timer);
  }, [movies.length, goTo]);

  if (!movie) return null;

  const title = tmdb?.title ?? movie.title;
  const year = tmdb?.release_date?.slice(0, 4) ?? movie.year;
  const rating = tmdb?.vote_average ?? movie.rating;
  const runtime = tmdb?.runtime
    ? `${Math.floor(tmdb.runtime / 60)}h ${tmdb.runtime % 60}min`
    : null;
  const overview = tmdb?.overview;
  const genres = tmdb?.genres?.slice(0, 3);

  return (
    <div
      className="relative left-1/2 -ml-[50vw] w-screen -mt-6 mb-2"
      onTouchStart={(e) => {
        touchStart.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const diff = touchStart.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) goTo(diff > 0 ? "next" : "prev");
      }}
    >
      {/* Backdrop */}
      <div className="relative h-48 sm:h-72 md:h-96 overflow-hidden">
        <img
          key={movie.tmdb_id}
          src={
            tmdb?.backdrop_path
              ? `${IMAGE_BASE}/original${tmdb.backdrop_path}`
              : `${JELLYFIN_URL}/Items/${movie.jellyfin_id}/Images/Backdrop?maxWidth=1920`
          }
          alt={title}
          className="h-full w-full object-cover object-[center_25%] animate-in fade-in duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 inset-x-0 pb-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end gap-4">
            <div className="flex-1 min-w-0">
              <MovieLogo tmdbId={movie.tmdb_id} title={title} />
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-muted-foreground">
                {year && <span>{year}</span>}
                {runtime && <span className="hidden sm:inline">{runtime}</span>}
                {rating != null && rating > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Star className="size-3 sm:size-3.5 fill-yellow-400 text-yellow-400" />
                    {rating.toFixed(1)}
                  </span>
                )}
                {genres?.map((g) => (
                  <span
                    key={g.id}
                    className="hidden sm:inline rounded-full border px-2 py-0.5 text-xs"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
              {overview && (
                <p className="hidden sm:block mt-2 text-sm text-muted-foreground line-clamp-2 max-w-xl">
                  {overview}
                </p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  asChild
                >
                  <a
                    href={`${JELLYFIN_URL}/web/index.html#!/details?id=${movie.jellyfin_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Play className="size-4" />
                    Assistir
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link
                    to="/movie/$movieId"
                    params={{ movieId: movie.tmdb_id }}
                  >
                    Detalhes
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Dots */}
          {movies.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {movies.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1 rounded-full transition-all ${
                    i === current ? "w-6 bg-white" : "w-1.5 bg-white/30"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MovieLogo({ tmdbId, title }: { tmdbId: string; title: string }) {
  const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE;
  const { data: logoPath } = useQuery({
    queryKey: ["movie-logo", tmdbId],
    queryFn: async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${tmdbId}/images?include_image_language=pt-BR,en,null`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_TOKEN}`,
          },
        },
      );
      const data = await res.json();
      const logo =
        data.logos?.find((l: any) => l.iso_639_1 === "pt") ??
        data.logos?.find((l: any) => l.iso_639_1 === "en") ??
        data.logos?.[0];
      return logo?.file_path ?? null;
    },
    staleTime: 1000 * 60 * 60,
  });

  if (logoPath) {
    return (
      <img
        src={`${IMAGE_BASE}/w500${logoPath}`}
        alt={title}
        className="h-12 sm:h-16 max-w-xs object-contain object-left drop-shadow-lg"
      />
    );
  }

  return (
    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight truncate font-heading">
      {title}
    </h2>
  );
}

function ScrollRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll]);

  const scroll = (dir: "left" | "right") => {
    ref.current?.scrollBy({
      left: dir === "left" ? -400 : 400,
      behavior: "smooth",
    });
  };

  return (
    <div className="group/scroll relative">
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-8 z-10 flex w-10 items-center justify-center bg-gradient-to-r from-background to-transparent opacity-0 transition-opacity group-hover/scroll:opacity-100"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}
      <div ref={ref} className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {children}
      </div>
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-8 z-10 flex w-10 items-center justify-center bg-gradient-to-l from-background to-transparent opacity-0 transition-opacity group-hover/scroll:opacity-100"
        >
          <ChevronRight className="size-5" />
        </button>
      )}
    </div>
  );
}

function RecommendationsRow({
  movies,
}: {
  movies: Array<Movie & { basedOn: string }>;
}) {
  const groups = new Map<string, Movie[]>();
  for (const m of movies) {
    const list = groups.get(m.basedOn) ?? [];
    list.push(m);
    groups.set(m.basedOn, list);
  }

  return (
    <div className="space-y-4">
      {Array.from(groups.entries()).map(([basedOn, items]) => (
        <div key={basedOn} className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Porque você adicionou{" "}
            <span className="text-foreground font-semibold">{basedOn}</span>
          </p>
          <ScrollRow>
            {items.map((movie) => (
              <Link
                key={movie.id}
                to="/movie/$movieId"
                params={{ movieId: String(movie.id) }}
                className="group shrink-0 w-24 sm:w-32"
              >
                <img
                  src={posterUrl(movie.poster_path, "w185")}
                  alt={movie.title}
                  className="h-36 w-24 sm:h-48 sm:w-32 rounded-lg object-cover bg-muted transition-opacity group-hover:opacity-80"
                />
                <p className="mt-1.5 text-sm font-medium truncate">
                  {movie.title}
                </p>
              </Link>
            ))}
          </ScrollRow>
        </div>
      ))}
    </div>
  );
}

function MovieGrid({ skeleton }: { skeleton: boolean }) {
  if (!skeleton) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}
