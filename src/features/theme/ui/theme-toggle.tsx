import { Moon, Sun } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { useThemeStore } from '../model/theme.store'
import { resolveEffectiveTheme } from '../model/theme.store'

export function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode)
  const toggle = useThemeStore((s) => s.toggle)
  const effective = resolveEffectiveTheme(mode)

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
    >
      {effective === 'dark' ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  )
}
