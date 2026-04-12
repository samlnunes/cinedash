import {
  AlertCircle,
  BookmarkMinus,
  BookmarkPlus,
  Calendar,
  Clock,
  MessageSquare,
  Play,
  Plus,
  Star,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { posterUrl } from "@/shared/api/tmdb/client";
import { DetailsSkeleton } from "@/shared/ui/details-skeleton";
import type { Movie } from "@/entities/movie";
import {
  useMovieDetailsQuery,
  MovieTrailer,
  MovieCastList,
  MovieWatchProviders,
} from "@/features/movie-details";
import { useIsInWatchlist, useToggleWatchlist } from "@/features/watchlist";
import {
  useHasRequested,
  RequestModal,
  REQUEST_STATUS_LABELS,
} from "@/features/requests";
import { JellyfinBadge, useJellyfinAvailability } from "@/features/jellyfin";
import { StarRating } from "@/features/ratings";
import { CreatePostModal } from "@/features/feed";
import { Badge } from "@/shared/ui/badge";

interface MovieDetailsViewProps {
  movieId: number;
}

export function MovieDetailsView({ movieId }: MovieDetailsViewProps) {
  const {
    detail,
    credits,
    trailer,
    watchProviders,
    isLoading,
    isError,
    error,
    refetch,
  } = useMovieDetailsQuery(movieId);

  if (isLoading) return <DetailsSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <AlertCircle className="size-10 text-destructive" />
        <p className="text-sm text-muted-foreground">
          {error?.message ?? "Erro ao carregar detalhes do filme."}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!detail) return null;

  const year = detail.release_date?.split("-")[0] ?? "—";
  const runtime = detail.runtime
    ? `${Math.floor(detail.runtime / 60)}h ${detail.runtime % 60}min`
    : null;
  const genreNames = detail.genres.map((g) => g.name).join(", ");

  const movieForWatchlist: Movie = {
    id: detail.id,
    title: detail.title,
    overview: detail.overview,
    poster_path: detail.poster_path,
    backdrop_path: detail.backdrop_path,
    release_date: detail.release_date,
    vote_average: detail.vote_average,
    vote_count: detail.vote_count,
    genre_ids: detail.genres.map((g) => g.id),
    original_language: detail.original_language,
  };

  return (
    <div>
      <HeroSection
        title={detail.title}
        tagline={detail.tagline}
        overview={detail.overview}
        posterPath={detail.poster_path}
        backdropPath={detail.backdrop_path}
        year={year}
        runtime={runtime}
        rating={detail.vote_average}
        genreNames={genreNames}
        movie={movieForWatchlist}
        watchProviders={watchProviders ?? undefined}
      />

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold">Elenco</h2>
        <MovieCastList cast={credits?.cast ?? []} />
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold">Trailer</h2>
        <MovieTrailer trailer={trailer} />
      </section>
    </div>
  );
}

function HeroSection({
  title,
  tagline,
  overview,
  posterPath,
  backdropPath,
  year,
  runtime,
  rating,
  genreNames,
  movie,
  watchProviders,
}: {
  title: string;
  tagline: string | null;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  year: string;
  runtime: string | null;
  rating: number;
  genreNames: string;
  movie: Movie;
  watchProviders?: import("@/entities/movie").WatchProviderCountry;
}) {
  const { toggle, isPending: watchlistPending } = useToggleWatchlist();
  const inList = useIsInWatchlist(movie.id);
  const { data: existing } = useHasRequested(movie.id);
  const { data: jellyfin } = useJellyfinAvailability(movie.id);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);

  return (
    <div>
      <div className="relative -mt-6 left-1/2 -ml-[50vw] w-screen h-44 sm:h-56">
        {backdropPath ? (
          <img
            src={posterUrl(backdropPath, "original")}
            alt="Backdrop"
            className="h-full w-full object-cover object-[center_25%]"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:gap-8">
        <img
          src={posterUrl(posterPath, "w500")}
          alt={title}
          className="-mt-24 w-48 shrink-0 self-start rounded-lg object-cover shadow-xl ring-4 ring-background sm:w-56 md:w-64"
        />

        <div className="flex flex-1 flex-col gap-4 pt-2 sm:pt-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {title}
            </h1>
            {tagline && (
              <p className="mt-1 text-sm italic text-muted-foreground">
                {tagline}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3.5" />
              {year}
            </span>
            {runtime && (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" />
                {runtime}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
              {rating.toFixed(1)}
            </span>
          </div>

          {genreNames && (
            <div className="flex flex-wrap gap-1.5">
              <JellyfinBadge tmdbId={movie.id} />
              {genreNames.split(", ").map((name) => (
                <Badge key={name} variant="outline">
                  {name}
                </Badge>
              ))}
            </div>
          )}

          {overview ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {overview}
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
              onClick={() => toggle(movie)}
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
                  href={`${import.meta.env.VITE_JELLYFIN_URL}/web/index.html#!/details?id=${jellyfin.jellyfin_id}`}
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
                Solicitar filme
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
              movie={movie}
              open={requestModalOpen}
              onOpenChange={setRequestModalOpen}
            />
            <CreatePostModal
              movie={movie}
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
              <StarRating tmdbId={movie.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
