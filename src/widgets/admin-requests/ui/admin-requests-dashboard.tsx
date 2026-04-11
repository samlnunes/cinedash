import { useState } from "react";
import { Inbox } from "lucide-react";
import { posterUrl } from "@/shared/api/tmdb/client";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
  useAdminRequests,
  RequestFilters,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_COLORS,
  type RequestStatus,
} from "@/features/requests";
import { AdminActions } from "@/features/requests/ui/admin-actions";

export function AdminRequestsDashboard() {
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">(
    "all",
  );
  const { data: requests, isLoading } = useAdminRequests(
    statusFilter === "all" ? undefined : statusFilter,
  );

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
        <div className="space-y-3">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex items-center gap-4 rounded-lg border bg-card p-4"
            >
              <img
                src={posterUrl(request.poster_path, "w185")}
                alt={request.title}
                className="h-20 w-14 rounded object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{request.title}</p>
                  {request.year && (
                    <span className="text-sm text-muted-foreground shrink-0">
                      ({request.year})
                    </span>
                  )}
                </div>
                {request.note && (
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {request.note}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-1">
                  {(request as any).profiles && (
                    <>
                      <Avatar className="size-4">
                        <AvatarImage src={(request as any).profiles.avatar_url ?? undefined} />
                        <AvatarFallback className="text-[8px]">
                          {((request as any).profiles.display_name ?? '?')[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {(request as any).profiles.display_name}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                    </>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(request.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
              <Badge className={REQUEST_STATUS_COLORS[request.status]}>
                {REQUEST_STATUS_LABELS[request.status]}
              </Badge>
              <AdminActions request={request} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
