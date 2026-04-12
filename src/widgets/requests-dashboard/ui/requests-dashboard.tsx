import { useState } from 'react'
import { Inbox, Users } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  useMyRequests,
  useCommunityRequests,
  RequestCard,
  RequestFilters,
  type RequestStatus,
} from '@/features/requests'
import { CommunityRequestCard, groupCommunityRequests } from '@/features/requests/ui/community-request-card'

type Tab = 'mine' | 'community'

export function RequestsDashboard() {
  const [tab, setTab] = useState<Tab>('mine')
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all')
  const { data: myRequests, isLoading: myLoading } = useMyRequests()
  const { data: communityRequests, isLoading: communityLoading } = useCommunityRequests()
  const grouped = communityRequests ? groupCommunityRequests(communityRequests as any) : []

  const filtered =
    statusFilter === 'all'
      ? myRequests
      : myRequests?.filter((r) => r.status === statusFilter)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
        <p className="text-muted-foreground">
          {tab === 'mine'
            ? 'Acompanhe o status dos filmes que você pediu.'
            : 'Vote nos pedidos da comunidade para priorizá-los.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border bg-muted p-0.5">
          <Button
            variant={tab === 'mine' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTab('mine')}
          >
            Meus
          </Button>
          <Button
            variant={tab === 'community' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTab('community')}
          >
            <Users className="size-4" />
            Comunidade
            {communityRequests && communityRequests.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium">
                {communityRequests.length}
              </span>
            )}
          </Button>
        </div>
        {tab === 'mine' && (
          <RequestFilters value={statusFilter} onChange={setStatusFilter} />
        )}
      </div>

      {tab === 'mine' && (
        <>
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
        </>
      )}

      {tab === 'community' && (
        <>
          {communityLoading && <SkeletonGrid />}

          {!communityLoading && grouped.length === 0 && (
            <Empty message="Nenhum pedido pendente da comunidade." />
          )}

          {grouped.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {grouped.map((group) => (
                <CommunityRequestCard key={group.tmdb_id} group={group} />
              ))}
            </div>
          )}
        </>
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
