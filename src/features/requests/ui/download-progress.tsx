import type { Request } from '../types/request.types'

interface DownloadProgressProps {
  request: Pick<Request, 'status' | 'download_progress_pct' | 'download_eta'>
  className?: string
}

// Renderiza barra fina de progresso + % + ETA quando o filme está baixando.
// Só aparece se status === 'downloading' e temos pelo menos progresso ou ETA.
export function DownloadProgress({ request, className = '' }: DownloadProgressProps) {
  if (request.status !== 'downloading') return null

  const pct = request.download_progress_pct
  const eta = request.download_eta
  if (pct == null && !eta) return null

  const pctDisplay = pct ?? 0
  const etaText = formatEta(eta)

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center justify-between text-xs text-muted-foreground tabular-nums">
        <span>
          {pct != null ? `${pctDisplay}%` : 'Baixando...'}
        </span>
        {etaText && <span>{etaText}</span>}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${pctDisplay}%` }}
        />
      </div>
    </div>
  )
}

function formatEta(iso: string | null | undefined): string | null {
  if (!iso) return null
  const target = new Date(iso)
  if (Number.isNaN(target.getTime())) return null
  const diffMs = target.getTime() - Date.now()
  if (diffMs <= 0) return 'quase lá'

  const minutes = Math.round(diffMs / 60_000)
  if (minutes < 1) return 'menos de 1 min'
  if (minutes < 60) return `~${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `~${hours}h`
  const days = Math.round(hours / 24)
  return `~${days}d`
}
