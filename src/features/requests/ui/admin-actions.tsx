import { useState } from 'react'
import { Clapperboard } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Textarea } from '@/shared/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { supabase } from '@/lib/supabase'
import { useUpdateRequestStatus } from '../hooks/use-admin-requests'
import type { Request, RequestStatus } from '../types/request.types'
import { REQUEST_STATUS_LABELS, REQUEST_STATUS_COLORS } from '../types/request.types'

const STATUS_ORDER: RequestStatus[] = ['pending', 'approved', 'downloading', 'done', 'rejected']

interface AdminActionsProps {
  request: Request
}

export function AdminActions({ request }: AdminActionsProps) {
  const updateStatus = useUpdateRequestStatus()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [adminNote, setAdminNote] = useState('')
  const [sendingToRadarr, setSendingToRadarr] = useState(false)

  const handleUpdate = (status: RequestStatus, note?: string) => {
    updateStatus.mutate({ requestId: request.id, status, adminNote: note })
  }

  const handleReject = () => {
    handleUpdate('rejected', adminNote.trim() || undefined)
    setAdminNote('')
    setRejectOpen(false)
  }

  const handleSendToRadarr = async () => {
    setSendingToRadarr(true)
    try {
      const { error } = await supabase.functions.invoke('radarr-add', {
        body: { tmdb_id: request.tmdb_id, title: request.title },
      })
      if (!error) handleUpdate('downloading')
    } finally {
      setSendingToRadarr(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-1">
        {request.media_type === 'movie' && request.status !== 'done' && (
          <Button
            variant="ghost"
            size="xs"
            onClick={handleSendToRadarr}
            disabled={sendingToRadarr || updateStatus.isPending}
            title="Enviar ao Radarr"
          >
            <Clapperboard className="size-3.5 text-orange-500" />
          </Button>
        )}
        <AdminStatusBadge
          status={request.status}
          onSelect={(s) => s === 'rejected' ? setRejectOpen(true) : handleUpdate(s)}
          disabled={updateStatus.isPending}
        />
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recusar pedido</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Recusar o pedido de <strong>{request.title}</strong>?
          </p>
          <Textarea
            placeholder="Motivo da recusa (opcional)"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleReject}>Recusar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function AdminStatusBadge({
  status,
  onSelect,
  disabled,
}: {
  status: RequestStatus
  onSelect: (status: RequestStatus) => void
  disabled: boolean
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button className="cursor-pointer">
          <Badge className={`${REQUEST_STATUS_COLORS[status]} hover:opacity-80 transition-opacity`}>
            {REQUEST_STATUS_LABELS[status]}
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {STATUS_ORDER.filter((s) => s !== status && s !== 'rejected').map((s) => (
          <DropdownMenuItem key={s} onClick={() => onSelect(s)}>
            <span className={`size-2 rounded-full ${REQUEST_STATUS_COLORS[s]}`} />
            {REQUEST_STATUS_LABELS[s]}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={() => onSelect('rejected')}>
          <span className={`size-2 rounded-full ${REQUEST_STATUS_COLORS.rejected}`} />
          {REQUEST_STATUS_LABELS.rejected}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
