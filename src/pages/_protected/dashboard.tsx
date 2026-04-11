import { createFileRoute } from '@tanstack/react-router'
import { DiscoveryDashboard } from '@/widgets/discovery-dashboard'

export const Route = createFileRoute('/_protected/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  return <DiscoveryDashboard />
}
