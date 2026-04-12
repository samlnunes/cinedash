import { createFileRoute } from '@tanstack/react-router'
import { SeriesDashboard } from '@/widgets/series-dashboard'

export const Route = createFileRoute('/_protected/series')({
  component: SeriesPage,
})

function SeriesPage() {
  return <SeriesDashboard />
}
