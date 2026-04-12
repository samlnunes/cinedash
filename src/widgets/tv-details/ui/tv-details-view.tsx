import { useQuery } from "@tanstack/react-query";
import { DetailsSkeleton } from "@/shared/ui/details-skeleton";
import {
  AlertCircle,
  BookmarkMinus,
  BookmarkPlus,
  Calendar,
  MessageSquare,
  Star,
  Tv,
  Play,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { posterUrl } from "@/shared/api/tmdb/client";
import {
  getTvDetails,
  getTvCredits,
  getTvVideos,
  getTvWatchProviders,
} from "@/entities/movie/api/movie.api";
import {
  MovieCastList,
  MovieTrailer,
  MovieWatchProviders,
} from "@/features/movie-details";
import { useIsInWatchlist, useToggleWatchlist } from "@/features/watchlist";
import {
  useHasRequested,
  RequestModal,
  REQUEST_STATUS_LABELS,
} from "@/features/requests";
import { useJellyfinAvailability } from "@/features/jellyfin";
import { StarRating } from "@/features/ratings";
import { CreatePostModal } from "@/features/feed";
import type { MovieVideo } from "@/entities/movie";

const JELLYFIN_URL = import.meta.env.VITE_JELLYFIN_URL;

function selectTrailer(videos: MovieVideo[]): MovieVideo | null {
  return (
    videos.find(
      (v) => v.site === "YouTube" && v.type === "Trailer" && v.official,
    ) ??
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ??
    videos.find((v) => v.site === "YouTube") ??
    null
  );
}

interface TvDetailsViewProps {
  tvId: number;
}

export function TvDetailsView({ tvId }: TvDetailsViewProps) {
  const {
    data: detail,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["tv", "detail", tvId],
    queryFn: () => getTvDetails(tvId),
    staleTime: 1000 * 60 * 10,
  });
  const { data: credits } = useQuery({
    queryKey: ["tv", "credits", tvId],
    queryFn: () => getTvCredits(tvId),
    staleTime: 1000 * 60 * 30,
  });
  const { data: videos } = useQuery({
    queryKey: ["tv", "videos", tvId],
    queryFn: () => getTvVideos(tvId),
    staleTime: 1000 * 60 * 30,
  });
  const { data: watchProvidersData } = useQuery({
    queryKey: ["tv", "watchProviders", tvId],
    queryFn: () => getTvWatchProviders(tvId),
    staleTime: 1000 * 60 * 60,
  });
  const watchProviders = watchProvidersData?.results?.BR ?? null;
  const { toggle, isPending: watchlistPending } = useToggleWatchlist();
  const inList = useIsInWatchlist(tvId);
  const { data: existing } = useHasRequested(tvId);
  const { data: jellyfin } = useJellyfinAvailability(tvId);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);

  const trailer = videos ? selectTrailer(videos.results) : null;

  if (isLoading) return <DetailsSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <AlertCircle className="size-10 text-destructive" />
        <p className="text-sm text-muted-foreground">
          {error?.message ?? "Erro ao carregar detalhes."}
        </p>
      </div>
    );
  }

  if (!detail) return null;

  const year = detail.first_air_date?.split("-")[0] ?? "—";
  const genreNames = detail.genres.map((g) => g.name);

  // Build a Movie-like object for the request modal
  const movieForRequest = {
    id: detail.id,
    title: detail.name,
    overview: detail.overview,
    poster_path: detail.poster_path,
    backdrop_path: detail.backdrop_path,
    release_date: detail.first_air_date,
    vote_average: detail.vote_average,
    vote_count: detail.vote_count,
    genre_ids: detail.genres.map((g) => g.id),
    original_language: detail.original_language,
  };

  return (
    <div>
      {/* Backdrop */}
      <div className="relative -mt-6 left-1/2 -ml-[50vw] w-screen h-44 sm:h-56">
        {detail.backdrop_path ? (
          <img
            src={posterUrl(detail.backdrop_path, "original")}
            alt="Backdrop"
            className="h-full w-full object-cover object-[center_25%]"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
      </div>

      {/* Hero */}
      <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:gap-8">
        <img
          src={posterUrl(detail.poster_path, "w500")}
          alt={detail.name}
          className="-mt-24 w-48 shrink-0 self-start rounded-lg object-cover shadow-xl ring-4 ring-background sm:w-56 md:w-64"
        />

        <div className="flex flex-1 flex-col gap-4 pt-2 sm:pt-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {detail.name}
            </h1>
            {detail.tagline && (
              <p className="mt-1 text-sm italic text-muted-foreground">
                {detail.tagline}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3.5" />
              {year}
            </span>
            <span className="inline-flex items-center gap-1">
              <Tv className="size-3.5" />
              {detail.number_of_seasons} temp. · {detail.number_of_episodes} ep.
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
              {detail.vote_average.toFixed(1)}
            </span>
          </div>

          {genreNames.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {genreNames.map((name) => (
                <Badge key={name} variant="outline">
                  {name}
                </Badge>
              ))}
            </div>
          )}

          {detail.overview ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {detail.overview}
            </p>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              Sinopse indisponível.
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant={inList ? "outline" : "default"}
              size="sm"
              onClick={() => toggle(movieForRequest)}
              disabled={watchlistPending}
            >
              {inList ? (
                <>
                  <BookmarkMinus className="size-4" />
                  Remover da minha lista
                </>
              ) : (
                <>
                  <BookmarkPlus className="size-4" />
                  Adicionar à minha lista
                </>
              )}
            </Button>
            {jellyfin?.available && jellyfin.jellyfin_id ? (
              <Button
                variant="outline"
                size="sm"
                className="text-green-500 border-green-500/30 hover:text-green-400"
                asChild
              >
                <a
                  href={`${JELLYFIN_URL}/web/index.html#!/details?id=${jellyfin.jellyfin_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Play className="size-4" />
                  Assistir
                </a>
              </Button>
            ) : existing ? (
              <Button variant="outline" size="sm" disabled>
                {
                  REQUEST_STATUS_LABELS[
                    existing.status as keyof typeof REQUEST_STATUS_LABELS
                  ]
                }
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRequestModalOpen(true)}
              >
                <Plus className="size-4" />
                Solicitar série
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPostModalOpen(true)}
            >
              <MessageSquare className="size-4" />
              Compartilhar
            </Button>
            <RequestModal
              movie={movieForRequest}
              open={requestModalOpen}
              onOpenChange={setRequestModalOpen}
            />
            <CreatePostModal
              movie={{
                ...movieForRequest,
                media_type: "tv",
                name: detail.name,
              }}
              open={postModalOpen}
              onOpenChange={setPostModalOpen}
            />
          </div>

          <div className="flex items-center gap-4">
            {watchProviders && (
              <MovieWatchProviders providers={watchProviders} />
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sua nota:</span>
              <StarRating tmdbId={detail.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Cast */}
      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold">Elenco</h2>
        <MovieCastList cast={credits?.cast ?? []} />
      </section>

      {/* Trailer */}
      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold">Trailer</h2>
        <MovieTrailer trailer={trailer} />
      </section>
    </div>
  );
}
