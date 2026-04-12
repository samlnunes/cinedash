import { createFileRoute } from '@tanstack/react-router'
import { UpcomingDashboard } from '@/widgets/upcoming-dashboard'

export const Route = createFileRoute('/_protected/upcoming')({
  component: UpcomingPage,
})

function UpcomingPage() {
  return <UpcomingDashboard />
}
