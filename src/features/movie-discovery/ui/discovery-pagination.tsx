import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { useDiscoveryStore } from '../model/discovery.store'

interface DiscoveryPaginationProps {
  totalPages: number
}

export function DiscoveryPagination({
  totalPages,
}: DiscoveryPaginationProps) {
  const { page, setPage } = useDiscoveryStore()

  const safeTotal = Math.min(totalPages, 500)

  if (safeTotal <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
      >
        <ChevronLeft className="size-4" />
        Anterior
      </Button>

      <span className="min-w-[5rem] text-center text-sm text-muted-foreground">
        {page} / {safeTotal}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={page >= safeTotal}
        onClick={() => setPage(page + 1)}
      >
        Próxima
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}
