import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { movieQueries, type MovieVideo } from '@/entities/movie'

function selectTrailer(videos: MovieVideo[]): MovieVideo | null {
  const youtubeVideos = videos.filter((v) => v.site === 'YouTube')

  const officialTrailer = youtubeVideos.find(
    (v) => v.type === 'Trailer' && v.official,
  )
  if (officialTrailer) return officialTrailer

  const anyTrailer = youtubeVideos.find((v) => v.type === 'Trailer')
  if (anyTrailer) return anyTrailer

  const anyTeaser = youtubeVideos.find((v) => v.type === 'Teaser')
  if (anyTeaser) return anyTeaser

  return youtubeVideos[0] ?? null
}

export function useMovieDetailsQuery(movieId: number) {
  const detail = useQuery(movieQueries.detail(movieId))
  const credits = useQuery(movieQueries.credits(movieId))
  const videos = useQuery(movieQueries.videos(movieId))

  const trailer = useMemo(
    () => selectTrailer(videos.data?.results ?? []),
    [videos.data],
  )

  const isLoading = detail.isLoading || credits.isLoading || videos.isLoading
  const isError = detail.isError || credits.isError || videos.isError
  const error = detail.error ?? credits.error ?? videos.error

  function refetch() {
    return Promise.all([detail.refetch(), credits.refetch(), videos.refetch()])
  }

  return {
    detail: detail.data,
    credits: credits.data,
    trailer,
    isLoading,
    isError,
    error,
    refetch,
  }
}

export { selectTrailer }
