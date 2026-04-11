import { useState } from 'react'
import { Check, X, Download, CheckCircle } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { useUpdateRequestStatus } from '../hooks/use-admin-requests'
import type { Request, RequestStatus } from '../types/request.types'

interface AdminActionsProps {
  request: Request
}

export function AdminActions({ request }: AdminActionsProps) {
  const updateStatus = useUpdateRequestStatus()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [adminNote, setAdminNote] = useState('')

  const handleUpdate = (status: RequestStatus, note?: string) => {
    updateStatus.mutate({
      requestId: request.id,
      status,
      adminNote: note,
    })
  }

  const handleReject = () => {
    handleUpdate('rejected', adminNote.trim() || undefined)
    setAdminNote('')
    setRejectOpen(false)
  }

  if (request.status === 'done' || request.status === 'rejected') {
    return null
  }

  return (
    <>
      <div className="flex gap-1">
        {request.status === 'pending' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUpdate('approved')}
              disabled={updateStatus.isPending}
              title="Aprovar"
            >
              <Check className="size-4 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRejectOpen(true)}
              disabled={updateStatus.isPending}
              title="Recusar"
            >
              <X className="size-4 text-red-600" />
            </Button>
          </>
        )}
        {request.status === 'approved' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleUpdate('downloading')}
            disabled={updateStatus.isPending}
            title="Marcar como baixando"
          >
            <Download className="size-4 text-purple-600" />
          </Button>
        )}
        {request.status === 'downloading' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleUpdate('done')}
            disabled={updateStatus.isPending}
            title="Marcar como concluído"
          >
            <CheckCircle className="size-4 text-green-600" />
          </Button>
        )}
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
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Recusar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
