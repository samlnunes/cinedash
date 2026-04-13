import { Shield } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { useAdminUsers, type AdminUser } from '@/features/requests/hooks/use-admin-users'

interface UsersListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectUser?: (user: AdminUser) => void
}

export function UsersListDialog({ open, onOpenChange, onSelectUser }: UsersListDialogProps) {
  const { data: users, isLoading } = useAdminUsers(open)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Usuários</DialogTitle>
          <DialogDescription>
            {users ? `${users.length} pessoa${users.length === 1 ? '' : 's'} no CineDash` : 'Carregando...'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto -mx-6 px-6">
          {isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          )}

          {users && users.length > 0 && (
            <ul className="space-y-1">
              {users.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectUser?.(u)
                      onOpenChange(false)
                    }}
                    className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent/50"
                  >
                    <Avatar className="size-9">
                      <AvatarImage src={u.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {(u.display_name ?? '?')[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate">
                          {u.display_name}
                        </p>
                        {u.role === 'admin' && (
                          <Badge variant="secondary" className="h-4 gap-0.5 px-1.5 text-[10px]">
                            <Shield className="size-2.5" />
                            admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        entrou em {new Date(u.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold tabular-nums">{u.request_count}</p>
                      <p className="text-[10px] text-muted-foreground">
                        pedido{u.request_count === 1 ? '' : 's'}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {users && users.length === 0 && !isLoading && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Nenhum usuário cadastrado.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
