import { createFileRoute } from '@tanstack/react-router'
import { TvDetailsView } from '@/widgets/tv-details'

export const Route = createFileRoute('/_protected/tv/$tvId')({
  component: TvDetailsPage,
})

function TvDetailsPage() {
  const { tvId } = Route.useParams()
  return <TvDetailsView tvId={Number(tvId)} />
}
