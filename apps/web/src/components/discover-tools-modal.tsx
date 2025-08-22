"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, CheckCircle2 } from 'lucide-react'
import { FileText, Figma, GitBranch, Github, Trello, MessageCircle, Video, Palette } from 'lucide-react'

// Herramientas disponibles para añadir
export const AVAILABLE_TOOLS = [
    {
        id: "figma",
        name: "Figma",
        description: "Plataforma de diseño y colaboración para equipos.",
        icon: Figma,
        category: "Diseño",
        verified: true,
    },
    {
        id: "linear",
        name: "Linear",
        description: "Seguimiento de incidencias y gestión de proyectos para equipos de desarrollo.",
        icon: GitBranch,
        category: "Desarrollo",
        verified: true,
    },
    {
        id: "trello",
        name: "Trello",
        description: "Gestión visual de proyectos con tableros, listas y tarjetas.",
        icon: Trello,
        category: "Productividad",
        verified: true,
    },
    {
        id: "discord",
        name: "Discord",
        description: "Comunicación por voz, video y texto para comunidades.",
        icon: MessageCircle,
        category: "Comunicación",
        verified: true,
    },
    {
        id: "zoom",
        name: "Zoom",
        description: "Plataforma de videoconferencias y reuniones en línea.",
        icon: Video,
        category: "Comunicación",
        verified: true,
    },
    {
        id: "adobe-creative",
        name: "Adobe Creative Suite",
        description: "Herramientas creativas profesionales para diseño y creación de contenido.",
        icon: Palette,
        category: "Diseño",
        verified: true,
    },
]

interface DiscoverToolsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAddTool: (toolId: string) => void
}

export function DiscoverToolsModal({ open, onOpenChange, onAddTool }: DiscoverToolsModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader className="pb-6">
                    <DialogTitle className="text-2xl font-semibold tracking-tight">
                        Discover and connect MCPs
                    </DialogTitle>
                    <p className="text-muted-foreground text-sm">
                        Find new integrations to add to your workspace.
                    </p>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {AVAILABLE_TOOLS.map((tool) => {
                        const Icon = tool.icon
                        return (
                            <div
                                key={tool.id}
                                className="border rounded-lg p-6 hover:shadow-md transition-all hover:-translate-y-[1px]"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-2 rounded-lg bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),rgba(20,184,166,0.10),transparent_60%)] ring-1 ring-inset ring-[color-mix(in_srgb,var(--ring),transparent_60%)]">
                                        <Icon className="h-6 w-6 text-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-medium text-base tracking-tight">{tool.name}</h3>
                                            {tool.verified && (
                                                <CheckCircle2 className="h-4 w-4 text-[var(--brand-ring)]" />
                                            )}
                                        </div>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {tool.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary">
                                        {tool.category}
                                    </Badge>
                                    <Button
                                        onClick={() => onAddTool(tool.id)}
                                        variant="outline"
                                        size="sm"
                                        className="transition-transform hover:scale-[1.01]"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add {tool.name}
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="flex justify-end pt-6 border-t">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}