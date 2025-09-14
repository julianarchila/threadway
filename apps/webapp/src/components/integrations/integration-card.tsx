"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowUpRight,
  CheckCircle,
  Loader2,
  Trash2,
} from "lucide-react"
import { useAction } from "convex/react"
import { api } from "@threadway/backend/convex/api"
import type { Id } from "@threadway/backend/convex/dataModel"
import type { FunctionReturnType } from "convex/server"
import { toast } from "sonner"
import { getIntegrationIcon } from "./icon-map"

type UserConnection = FunctionReturnType<typeof api.integrations.queries.listUserConnections>[number]
type ConnectableIntegration = { name: string } & Pick<
  FunctionReturnType<typeof api.integrations.queries.listAvailableIntegrations>[number],
  "authConfigId" | "description" | "iconKey"
>

export function MyIntegrationCard({
  integration,
  onDelete,
}: {
  integration: UserConnection
  onDelete: (id: Id<"connections">, name: string) => void
}) {
  const IconComponent = getIntegrationIcon(integration.iconKey ?? integration.toolkitSlug ?? integration.name)

  return (
    <Card className="group hover:shadow-md transition-shadow border-2 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="p-2 rounded-lg bg-muted">
              <IconComponent className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base font-medium">
                {integration.displayName ?? integration.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2 overflow-hidden">
                {integration.description || "Connected integration"}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            type="button"
            aria-label={`Remove ${integration.name}`}
            title={`Remove ${integration.name}`}
            onClick={(e) => {
              e.stopPropagation()
              onDelete(integration._id, integration.name)
            }}
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
}

export function TemplateIntegrationCard({
  integration,
  isAlreadyAdded,
}: {
  integration: ConnectableIntegration
  isAlreadyAdded: boolean
}) {
  const [isConnecting, setIsConnecting] = useState(false)
  const initiateConnection = useAction(api.integrations.actions.initiateConnection)
  const IconComponent = getIntegrationIcon(integration.iconKey ?? integration.name)

  const handleConnect = async () => {
    if (isAlreadyAdded || isConnecting) return
    setIsConnecting(true)
    try {
      const { redirectUrl } = await initiateConnection({ authConfigId: integration.authConfigId })
      const opened = window.open(redirectUrl, "_blank")
      if (!opened) {
        window.location.assign(redirectUrl)
      }
    } catch (error: any) {
      toast.error(error?.message ?? `Failed to initiate ${integration.name} connection`)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Card
      className={`group hover:shadow-md transition-shadow border-2 ${
        isAlreadyAdded ? "opacity-50 cursor-not-allowed" : "cursor-pointer border-border/50 hover:border-primary/20"
      }`}
      role={!isAlreadyAdded ? "button" : undefined}
      tabIndex={!isAlreadyAdded ? 0 : -1}
      aria-disabled={isAlreadyAdded}
      onKeyDown={(e) => {
        if (isAlreadyAdded) return
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleConnect()
        }
      }}
      onClick={() => !isAlreadyAdded && handleConnect()}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-muted">
              <IconComponent className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-base font-medium">{integration.name}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2 overflow-hidden">
                {integration.description || "No description available"}
              </p>
            </div>
          </div>

          {isAlreadyAdded ? (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm">Added</span>
            </div>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              className="cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity flex items-center space-x-1"
              type="button"
              disabled={isConnecting}
              aria-busy={isConnecting}
              onClick={(e) => {
                e.stopPropagation()
                handleConnect()
              }}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                  <span>Connecting…</span>
                </>
              ) : (
                <>
                  <span>Connect</span>
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
    </Card>
  )
}
