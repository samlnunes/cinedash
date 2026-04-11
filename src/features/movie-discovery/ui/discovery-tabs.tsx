import { Button } from '@/shared/ui/button'
import {
  useDiscoveryStore,
  type DiscoveryTab,
} from '../model/discovery.store'

const TABS: { value: DiscoveryTab; label: string }[] = [
  { value: 'trending', label: 'Em Alta' },
  { value: 'popular', label: 'Populares' },
]

export function DiscoveryTabs() {
  const { tab, setTab } = useDiscoveryStore()

  return (
    <div className="flex gap-1">
      {TABS.map((t) => (
        <Button
          key={t.value}
          variant={tab === t.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab(t.value)}
        >
          {t.label}
        </Button>
      ))}
    </div>
  )
}
