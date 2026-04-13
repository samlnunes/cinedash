import { useState } from 'react'
import { Inbox } from 'lucide-react'
import {
  useMyRequests,
  useJellyseerrSync,
  RequestCard,
  RequestFilters,
  type RequestStatus,
} from '@/features/requests'

export function RequestsDashboard() {
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all')
  useJellyseerrSync()
  const { data: myRequests, isLoading: myLoading } = useMyRequests()

  const filtered =
    statusFilter === 'all'
      ? myRequests
      : myRequests?.filter((r) => r.status === statusFilter)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
        <p className="text-muted-foreground">
          Acompanhe o status dos filmes que você pediu.
        </p>
      </div>

      <div className="flex justify-end">
        <RequestFilters value={statusFilter} onChange={setStatusFilter} />
      </div>

      {myLoading && <SkeletonGrid />}

      {filtered && filtered.length === 0 && (
        <Empty
          message={
            statusFilter === 'all'
              ? 'Você ainda não fez nenhum pedido.'
              : 'Nenhum pedido com este status.'
          }
        />
      )}

      {filtered && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  )
}

function Empty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <Inbox className="size-10 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="h-36 animate-pulse rounded-lg border bg-muted" />
      ))}
    </div>
  )
}
