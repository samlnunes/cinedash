import { createFileRoute } from '@tanstack/react-router'
import { WatchlistDashboard } from '@/widgets/watchlist-dashboard'

export const Route = createFileRoute('/_protected/watchlist')({
  component: WatchlistPage,
})

function WatchlistPage() {
  return <WatchlistDashboard />
}
