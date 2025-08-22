"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Github, CloudSun, Zap } from "lucide-react"

export interface Integration {
  id: string
  name: string
  description?: string
  icon: string // Changed to string identifier
  isActive: boolean
  category?: string
}

// Icon mapping for client component
const iconMap = {
  'github': Github,
  'cloud-sun': CloudSun,
  'zap': Zap,
} as const

interface IntegrationCardProps {
  integration: Integration
  onToggle: (id: string) => void
  onConfigure: (id: string) => void
}

export function IntegrationCard({
  integration,
  onToggle,
  onConfigure,
}: IntegrationCardProps) {
  const IconComponent = iconMap[integration.icon as keyof typeof iconMap] || Zap

  return (
    <Card className="border border-muted/60 transition-all hover:-translate-y-[1px] hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-4 flex-1">
              <div className="p-2 rounded-lg bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),rgba(20,184,166,0.10),transparent_60%)] ring-1 ring-inset ring-[color-mix(in_srgb,var(--ring),transparent_60%)]">
                <IconComponent className="h-6 w-6 text-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="bold text-lg tracking-tight">{integration.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {integration.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConfigure(integration.id)}
              className="transition-transform hover:scale-[1.01]"
            >
              Configure
            </Button>
            <Switch
              checked={integration.isActive}
              onCheckedChange={() => onToggle(integration.id)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}