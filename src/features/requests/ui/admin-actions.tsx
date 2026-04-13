import { Badge } from '@/shared/ui/badge'
import type { Request } from '../types/request.types'
import { REQUEST_STATUS_LABELS, REQUEST_STATUS_COLORS } from '../types/request.types'

interface AdminActionsProps {
  request: Request
}

// Após integração com Jellyseerr (auto-approve), o status é ditado pelo webhook.
// O painel admin vira read-only: mostra o estado mas não permite override manual
// pra evitar desync com a fonte de verdade (Jellyseerr/Radarr/Sonarr).
export function AdminActions({ request }: AdminActionsProps) {
  return (
    <Badge className={`text-xs ${REQUEST_STATUS_COLORS[request.status]}`}>
      {REQUEST_STATUS_LABELS[request.status]}
    </Badge>
  )
}
