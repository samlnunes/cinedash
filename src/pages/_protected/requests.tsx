import { createFileRoute } from '@tanstack/react-router'
import { RequestsDashboard } from '@/widgets/requests-dashboard'

export const Route = createFileRoute('/_protected/requests')({
  component: RequestsPage,
})

function RequestsPage() {
  return <RequestsDashboard />
}
