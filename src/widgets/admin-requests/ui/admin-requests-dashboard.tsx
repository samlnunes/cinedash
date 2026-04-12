import { useState } from "react";
import { Inbox, Clock, CheckCircle, Download, Users, CalendarDays } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { posterUrl } from "@/shared/api/tmdb/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
  useAdminRequests,
  RequestFilters,
  type RequestStatus,
} from "@/features/requests";
import { AdminActions } from "@/features/requests/ui/admin-actions";
import { VoteButton } from "@/features/requests/ui/vote-button";
import { useAdminStats } from "@/features/requests/hooks/use-admin-stats";

export function AdminRequestsDashboard() {
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">(
    "all",
  );
  const { data: requests, isLoading } = useAdminRequests(
    statusFilter === "all" ? undefined : statusFilter,
  );
  const { data: stats } = useAdminStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel Admin</h1>
          <p className="text-muted-foreground">
            Gerencie os pedidos de filmes dos usuários.
          </p>
        </div>
        <RequestFilters value={statusFilter} onChange={setStatusFilter} />
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard icon={Clock} label="Pendentes" value={stats.pending} color="text-yellow-500" />
          <StatCard icon={CheckCircle} label="Aprovados" value={stats.approved} color="text-green-500" />
          <StatCard icon={Download} label="Baixando" value={stats.downloading} color="text-blue-500" />
          <StatCard icon={Users} label="Usuários" value={stats.users} color="text-purple-500" />
          <StatCard icon={CalendarDays} label="Este mês" value={stats.thisMonth} color="text-orange-500" />
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg border bg-muted"
            />
          ))}
        </div>
      )}

      {requests && requests.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Inbox className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhum pedido encontrado.
          </p>
        </div>
      )}

      {requests && requests.length > 0 && (
        <AdminRequestList requests={requests} />
      )}
    </div>
  );
}

function AdminRequestList({ requests }: { requests: any[] }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      {requests.map((request) => {
        const isTv = request.media_type === 'tv';
        const goToDetails = () => {
          if (isTv) {
            navigate({ to: '/tv/$tvId', params: { tvId: String(request.tmdb_id) } });
          } else {
            navigate({ to: '/movie/$movieId', params: { movieId: String(request.tmdb_id) } });
          }
        };
        const profile = (request as any).profiles;

        return (
          <div
            key={request.id}
            className="flex gap-3 rounded-lg border bg-card p-3 cursor-pointer transition-colors hover:bg-accent/50 overflow-hidden"
            onClick={goToDetails}
          >
            <img
              src={posterUrl(request.poster_path, "w185")}
              alt={request.title}
              className="h-24 w-16 rounded object-cover shrink-0"
            />
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <p className="text-sm font-medium line-clamp-2">{request.title}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {profile && (
                  <>
                    <Avatar className="size-3.5">
                      <AvatarImage src={profile.avatar_url ?? undefined} />
                      <AvatarFallback className="text-[7px]">
                        {(profile.display_name ?? '?')[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate max-w-[80px]">{profile.display_name}</span>
                    <span>·</span>
                  </>
                )}
                <span>{new Date(request.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="flex items-center justify-between mt-auto" onClick={(e) => e.stopPropagation()}>
                <VoteButton requestId={request.id} />
                <AdminActions request={request} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  color: string
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <Icon className={`size-4 ${color}`} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
