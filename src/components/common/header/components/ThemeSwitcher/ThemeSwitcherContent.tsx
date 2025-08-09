'use client'

import { useTheme } from 'next-themes'
import { Monitor } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

export const ThemeSwitcherContent = () => {
  const { theme, setTheme } = useTheme()

  const handleSystemThemeChange = (checked: boolean) => {
    if (checked) {
      setTheme('system')
    } else {
      // When system theme is disabled, set to corresponding light/dark theme based on current system theme
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setTheme(systemTheme)
    }
  }

  return (
    <div className="hidden md:flex items-center gap-2 bg-popover px-3 py-2 rounded-lg shadow-md outline-hidden focus:outline-hidden relative z-50">
      <Monitor className="w-4 h-4" />
      <Switch
        checked={theme === 'system'}
        onCheckedChange={handleSystemThemeChange}
        aria-label="Use system theme"
        className="outline-hidden focus:outline-hidden z-50"
      />
    </div>
  )
} 