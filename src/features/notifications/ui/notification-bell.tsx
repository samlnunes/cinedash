import { Bell, CheckCheck } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
} from '../hooks/use-notifications'

export function NotificationBell() {
  const { data: notifications } = useNotifications()
  const unread = useUnreadCount()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm font-semibold">Notificações</p>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="xs"
              className="text-muted-foreground"
              onClick={() => markAllAsRead.mutate()}
            >
              <CheckCheck className="size-3" />
              Marcar todas
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />

        {(!notifications || notifications.length === 0) && (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <Bell className="size-8 opacity-30" />
            <p className="text-sm">Nenhuma notificação</p>
          </div>
        )}

        <div className="max-h-80 overflow-y-auto divide-y [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-track]:bg-transparent">
          {notifications?.map((n) => (
            <button
              key={n.id}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent ${!n.read ? 'bg-accent/40' : ''}`}
              onClick={() => {
                if (!n.read) markAsRead.mutate(n.id)
                if (n.link) navigate({ to: n.link })
              }}
            >
              {!n.read && (
                <span className="mt-1.5 size-2 rounded-full bg-blue-500 shrink-0" />
              )}
              <div className={`flex-1 min-w-0 ${n.read ? 'ml-5' : ''}`}>
                {n.body && (
                  <p className={`text-sm leading-snug ${n.read ? 'text-muted-foreground' : ''}`}>
                    {n.body}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {formatRelative(n.created_at)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes}min atrás`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h atrás`

  const days = Math.floor(hours / 24)
  return `${days}d atrás`
}
