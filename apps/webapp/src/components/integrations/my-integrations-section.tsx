"use client"

import type { Id } from "@threadway/backend/convex/dataModel"
import { useMemo, useState } from "react"
import { MyIntegrationCard } from "./integration-card"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"

interface Integration {
  _id: Id<"connections">
  name: string
  toolkitSlug?: string
  displayName?: string
  description?: string
  iconKey?: string
}

interface MyIntegrationsSectionProps {
  searchTerm: string
  integrations: Integration[]
}

export function MyIntegrationsSection({
  searchTerm,
  integrations,
}: MyIntegrationsSectionProps) {
  const [toDelete, setToDelete] = useState<{ id: Id<"connections">; name: string } | null>(null)

  const displayedIntegrations = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase()
    if (!needle) return integrations
    return integrations.filter((integration) =>
      integration.name.toLowerCase().includes(needle)
    )
  }, [integrations, searchTerm])

  // No integrations added yet
  if (integrations.length === 0) {
    return null
  }

  // No integrations match the search
  if (displayedIntegrations.length === 0) {
    return null
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="text-base font-semibold text-muted-foreground mb-4">
          My Integrations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedIntegrations.map((integration) => (
            <MyIntegrationCard
              key={integration._id}
              integration={integration}
              onDelete={(id, name) =>
                setToDelete({ id: id as Id<"connections">, name })
              }
            />
          ))}
        </div>
      </div>

      <DeleteConfirmationDialog
        open={!!toDelete}
        name={toDelete?.name}
        connectionId={toDelete?.id}
        onOpenChange={(open) => {
          if (!open) setToDelete(null)
        }}
      />
    </>
  )
}