import { useState } from "react";
import { Inbox, CheckCircle, Download, Users, CalendarDays, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { posterUrl } from "@/shared/api/tmdb/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import {
  useAdminRequests,
  useJellyseerrSync,
  RequestFilters,
  DownloadProgress,
  type RequestStatus,
} from "@/features/requests";
import { AdminActions } from "@/features/requests/ui/admin-actions";
import { useAdminStats } from "@/features/requests/hooks/use-admin-stats";
import { UsersListDialog } from "./users-list-dialog";

export function AdminRequestsDashboard() {
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">(
    "all",
  );
  const [usersOpen, setUsersOpen] = useState(false);
  const [userFilter, setUserFilter] = useState<{
    id: string;
    display_name: string;
    avatar_url: string | null;
  } | null>(null);
  useJellyseerrSync();
  const { data: requests, isLoading } = useAdminRequests(
    statusFilter === "all" ? undefined : statusFilter,
    userFilter?.id,
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={CheckCircle} label="Aprovados" value={stats.approved} color="text-green-500" />
          <StatCard icon={Download} label="Baixando" value={stats.downloading} color="text-blue-500" />
          <StatCard
            icon={Users}
            label="Usuários"
            value={stats.users}
            color="text-purple-500"
            onClick={() => setUsersOpen(true)}
          />
          <StatCard icon={CalendarDays} label="Este mês" value={stats.thisMonth} color="text-orange-500" />
        </div>
      )}

      <UsersListDialog
        open={usersOpen}
        onOpenChange={setUsersOpen}
        onSelectUser={(u) =>
          setUserFilter({
            id: u.id,
            display_name: u.display_name,
            avatar_url: u.avatar_url,
          })
        }
      />

      {userFilter && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
          <Avatar className="size-6">
            <AvatarImage src={userFilter.avatar_url ?? undefined} />
            <AvatarFallback className="text-[10px]">
              {userFilter.display_name[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">
            Filtrando pedidos de <strong>{userFilter.display_name}</strong>
          </span>
          <Button
            variant="ghost"
            size="xs"
            className="ml-auto"
            onClick={() => setUserFilter(null)}
          >
            <X className="size-3" />
            Limpar
          </Button>
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
            className="flex gap-4 rounded-lg border bg-card p-4 cursor-pointer transition-colors hover:bg-accent/50 overflow-hidden"
            onClick={goToDetails}
          >
            <img
              src={posterUrl(request.poster_path, "w185")}
              alt={request.title}
              className="h-32 w-24 rounded object-cover shrink-0"
            />
            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
              <p className="text-base font-medium line-clamp-2">{request.title}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {profile && (
                  <>
                    <Avatar className="size-6">
                      <AvatarImage src={profile.avatar_url ?? undefined} />
                      <AvatarFallback className="text-[10px]">
                        {(profile.display_name ?? '?')[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate max-w-[140px]">{profile.display_name}</span>
                    <span>·</span>
                  </>
                )}
                <span>{new Date(request.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
              {request.note && (
                <p className="text-sm text-muted-foreground italic truncate">
                  "{request.note}"
                </p>
              )}
              <DownloadProgress request={request} className="mt-1" />
              <div className="flex items-center justify-end mt-auto" onClick={(e) => e.stopPropagation()}>
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
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  color: string
  onClick?: () => void
}) {
  const isClickable = Boolean(onClick)
  const Component = isClickable ? 'button' : 'div'
  return (
    <Component
      type={isClickable ? 'button' : undefined}
      onClick={onClick}
      className={`rounded-lg border bg-card p-4 text-left w-full ${
        isClickable ? 'cursor-pointer transition-colors hover:bg-accent/50' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`size-4 ${color}`} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </Component>
  );
}
