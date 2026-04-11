import { useEffect } from 'react'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/features/auth'
import { useDiscoveryStore } from '@/features/movie-discovery'
import { useThemeStore } from '@/features/theme'
import { ProtectedHeader } from '@/widgets/protected-header'

export const Route = createFileRoute('/_protected')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated()) {
      throw redirect({ to: '/login' })
    }
  },
  component: ProtectedLayout,
})

function ProtectedLayout() {
  const userId = useAuthStore((s) => s.user?.id)

  useEffect(() => {
    useDiscoveryStore.persist.rehydrate()
    useThemeStore.persist.rehydrate()
  }, [userId])

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <ProtectedHeader />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
