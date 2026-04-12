import { useState } from 'react'
import { Clock } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { useReminder, useSetReminder, useRemoveReminder } from '../hooks/use-reminders'

interface ReminderButtonProps {
  tmdbId: number
  title: string
  posterPath: string | null
}

function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

export function ReminderButton({ tmdbId, title, posterPath }: ReminderButtonProps) {
  const { data: reminder } = useReminder(tmdbId)
  const setReminder = useSetReminder()
  const removeReminder = useRemoveReminder()
  const [customOpen, setCustomOpen] = useState(false)

  const handleSet = (remindAt: string) => {
    setReminder.mutate({ tmdbId, title, posterPath, remindAt })
  }

  if (reminder) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="xs" className="text-orange-500 hover:text-orange-400">
            <Clock className="size-3" />
            {formatDate(reminder.remind_at)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleSet(addDays(1))}>
            Amanhã
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSet(addDays(3))}>
            Em 3 dias
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSet(addDays(7))}>
            Em 1 semana
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => removeReminder.mutate(tmdbId)}
          >
            Remover lembrete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="xs" className="text-muted-foreground">
            <Clock className="size-3" />
            Lembrar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleSet(addDays(1))}>
            Amanhã
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSet(addDays(3))}>
            Em 3 dias
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSet(addDays(7))}>
            Em 1 semana
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSet(addDays(14))}>
            Em 2 semanas
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSet(addDays(30))}>
            Em 1 mês
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCustomOpen(true)}>
            Escolher data...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {customOpen && (
        <CustomDatePicker
          onSelect={(date) => { handleSet(date); setCustomOpen(false) }}
          onClose={() => setCustomOpen(false)}
        />
      )}
    </>
  )
}

function CustomDatePicker({ onSelect, onClose }: { onSelect: (date: string) => void; onClose: () => void }) {
  const [date, setDate] = useState('')
  const tomorrow = addDays(1)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="rounded-lg border bg-card p-4 shadow-lg space-y-3" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-medium">Escolher data do lembrete</p>
        <input
          type="date"
          min={tomorrow}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={() => date && onSelect(date)} disabled={!date}>Salvar</Button>
        </div>
      </div>
    </div>
  )
}
