import type { Database } from '@/lib/database.types'

export type Request = Database['public']['Tables']['requests']['Row']
export type RequestInsert = Database['public']['Tables']['requests']['Insert']
export type RequestUpdate = Database['public']['Tables']['requests']['Update']

export type RequestStatus = Request['status']

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  downloading: 'Baixando',
  done: 'Concluído',
  rejected: 'Recusado',
}

export const REQUEST_STATUS_COLORS: Record<RequestStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  downloading: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  done: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}
