import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import type { RequestStatus } from '../types/request.types'
import { REQUEST_STATUS_LABELS } from '../types/request.types'

interface RequestFiltersProps {
  value: RequestStatus | 'all'
  onChange: (value: RequestStatus | 'all') => void
}

export function RequestFilters({ value, onChange }: RequestFiltersProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as RequestStatus | 'all')}
    >
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Filtrar status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos</SelectItem>
        {(
          Object.entries(REQUEST_STATUS_LABELS) as [RequestStatus, string][]
        )
          .filter(([key]) => key !== 'pending')
          .map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  )
}
