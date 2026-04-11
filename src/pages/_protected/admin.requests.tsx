import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/features/auth'
import { AdminRequestsDashboard } from '@/widgets/admin-requests'

export const Route = createFileRoute('/_protected/admin/requests')({
  beforeLoad: () => {
    const { isAdmin } = useAuthStore.getState()
    if (!isAdmin()) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AdminRequestsPage,
})

function AdminRequestsPage() {
  return <AdminRequestsDashboard />
}
