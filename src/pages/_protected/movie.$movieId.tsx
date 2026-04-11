import { createFileRoute } from '@tanstack/react-router'
import { MovieDetailsView } from '@/widgets/movie-details'

export const Route = createFileRoute('/_protected/movie/$movieId')({
  component: MovieDetailPage,
})

function MovieDetailPage() {
  const { movieId } = Route.useParams()

  return <MovieDetailsView movieId={Number(movieId)} />
}
