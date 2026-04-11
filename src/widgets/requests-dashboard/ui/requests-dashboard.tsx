import { useState } from 'react'
import { Inbox } from 'lucide-react'
import {
  useMyRequests,
  RequestCard,
  RequestFilters,
  type RequestStatus,
} from '@/features/requests'

export function RequestsDashboard() {
  const { data: requests, isLoading } = useMyRequests()
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all')

  const filtered =
    statusFilter === 'all'
      ? requests
      : requests?.filter((r) => r.status === statusFilter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Pedidos</h1>
          <p className="text-muted-foreground">
            Acompanhe o status dos filmes que você pediu.
          </p>
        </div>
        <RequestFilters value={statusFilter} onChange={setStatusFilter} />
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-lg border bg-muted"
            />
          ))}
        </div>
      )}

      {filtered && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Inbox className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {statusFilter === 'all'
              ? 'Você ainda não fez nenhum pedido.'
              : 'Nenhum pedido com este status.'}
          </p>
        </div>
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
