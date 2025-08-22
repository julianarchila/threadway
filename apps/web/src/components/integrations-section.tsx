"use client"

import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { IntegrationCard, type Integration } from "./integration-card"
import { DiscoverToolsModal } from "./discover-tools-modal"
import { CustomIntegrationPopover } from "./custom-integration-popover"

interface IntegrationsSectionProps {
  initialIntegrations: Integration[]
}

const AVAILABLE_TOOLS = [
  {
    id: "figma",
    name: "Figma",
    description: "Design collaboratively with your team.",
    icon: "zap",
    category: "Design",
  },
  {
    id: "jira",
    name: "Jira",
    description: "Track and manage your team's projects.",
    icon: "zap",
    category: "Productivity",
  },
];

export function IntegrationsSection({
  initialIntegrations,
}: IntegrationsSectionProps) {
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations)
  const [searchTerm, setSearchTerm] = useState("")
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [showDiscoverModal, setShowDiscoverModal] = useState(false)

  const handleToggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === id
          ? { ...integration, isActive: !integration.isActive }
          : integration
      )
    )
  }

  const handleConfigureIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === id ? { ...integration, isConfigured: true } : integration
      )
    )
  }

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (integration.description?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
    const matchesFilter = !showActiveOnly || integration.isActive
    return matchesSearch && matchesFilter
  })

  const handleAddCustomTool = (toolData: { name: string; url: string; apiKey: string }) => {
    const newIntegration: Integration = {
      id: `custom-${Date.now()}`,
      name: toolData.name,
      icon: "zap",
      category: "Custom",
      isActive: false,
    }
    setIntegrations(prev => [...prev, newIntegration])
  }

  const activeCount = integrations.filter((i) => i.isActive).length

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center justify-start gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--ring),transparent_50%)] bg-[color-mix(in_srgb,var(--accent),transparent_60%)] px-2.5 py-1 text-xs text-foreground/90 backdrop-blur">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[var(--brand-ring)]" />
                {activeCount} active
              </div>
              <Button
                variant="outline"
                onClick={() => setShowDiscoverModal(true)}
                className="transition-transform hover:scale-[1.01]"
              >
                Discover Integrations
              </Button>
              <CustomIntegrationPopover onAddTool={handleAddCustomTool} />
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search integration..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button
                variant={showActiveOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowActiveOnly(!showActiveOnly)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>{showActiveOnly ? "Show All" : "Active Only"}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Grid */}
        {filteredIntegrations.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onToggle={handleToggleIntegration}
                onConfigure={handleConfigureIntegration}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),rgba(20,184,166,0.10),transparent_60%)] ring-1 ring-inset ring-[color-mix(in_srgb,var(--ring),transparent_60%)]">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No integrations found
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? `No integrations match "${searchTerm}"`
                : "No integrations available"}
            </p>
            {(searchTerm || showActiveOnly) && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm("")
                  setShowActiveOnly(false)
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      <DiscoverToolsModal
        open={showDiscoverModal}
        onOpenChange={setShowDiscoverModal}
        onAddTool={(toolId) => {
          // Add the tool to integrations when user clicks
          const newTool = AVAILABLE_TOOLS.find(tool => tool.id === toolId)
          if (newTool) {
            const integration = {
              id: newTool.id,
              name: newTool.name,
              icon: newTool.icon,
              category: newTool.category,
              isActive: false,
              isConfigured: false,
            }
            setIntegrations(prev => [...prev, integration])
            setShowDiscoverModal(false)
          }
        }}
      />
    </div>
  )
}