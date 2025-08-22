"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from 'lucide-react'

type ThemeToggleProps = {
  size?: "icon" | "sm" | "default" | "lg"
  className?: string
}

export default function ThemeToggle({ size = "icon", className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const isDark = (mounted ? resolvedTheme : theme) === "dark"

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      aria-label="Toggle dark mode"
      className={className}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {mounted ? (
        isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
      ) : (
        // Avoid hydration mismatch by rendering a placeholder icon before mount
        <Sun className="h-4 w-4 opacity-0" />
      )}
    </Button>
  )
}
