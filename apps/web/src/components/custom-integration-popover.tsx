"use client"

import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, AlertCircle } from 'lucide-react'
import { toast } from "sonner"
import z from "zod"

interface CustomIntegrationPopoverProps {
    onAddTool: (toolData: { name: string; url: string; apiKey: string }) => void
}

export function CustomIntegrationPopover({ onAddTool }: CustomIntegrationPopoverProps) {
    const [open, setOpen] = useState(false)

    const form = useForm({
        defaultValues: {
            name: "",
            url: "",
            apiKey: "",
        },
        onSubmit: async ({ value }) => {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000))

                onAddTool(value)

                toast.success("Tool added successfully!")

                form.reset()
                setOpen(false)
            } catch (error) {
                console.error("Error:", error)
                toast.error("Error adding tool")
            }
        },
        validators: {
            onSubmit: z.object({
                name: z.string()
                    .min(1, "Name is required")
                    .min(2, "Name must be at least 2 characters"),
                url: z.string()
                    .min(1, "URL is required")
                    .url("Please enter a valid URL"),
                apiKey: z.string()
                    .min(1, "API Key is required")
                    .min(8, "API Key must be at least 8 characters"),
            }),
        },
    })

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            form.reset()
        }
    }

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="transition-transform hover:scale-[1.01]">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Integration
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">New Integration</h4>
                        <p className="text-sm text-muted-foreground">
                            Add your custom tool
                        </p>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            form.handleSubmit()
                        }}
                        className="space-y-3"
                    >
                        <div>
                            <form.Field name="name">
                                {(field) => (
                                    <div className="space-y-1">
                                        <Label htmlFor={field.name} className="text-xs">
                                            Name
                                        </Label>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            placeholder="My tool"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            className={`h-8 text-sm ${field.state.meta.errors.length > 0
                                                ? "border-red-500 focus-visible:ring-red-500"
                                                : ""
                                                }`}
                                        />
                                        {field.state.meta.errors.map((error) => (
                                            <div key={error?.message} className="flex items-center gap-1 text-xs text-red-600">
                                                <AlertCircle className="h-3 w-3" />
                                                {error?.message}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </form.Field>
                        </div>

                        <div>
                            <form.Field name="url">
                                {(field) => (
                                    <div className="space-y-1">
                                        <Label htmlFor={field.name} className="text-xs">
                                            API URL
                                        </Label>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            type="url"
                                            placeholder="https://api.example.com/mcp"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            className={`h-8 text-sm ${field.state.meta.errors.length > 0
                                                ? "border-red-500 focus-visible:ring-red-500"
                                                : ""
                                                }`}
                                        />
                                        {field.state.meta.errors.map((error) => (
                                            <div key={error?.message} className="flex items-center gap-1 text-xs text-red-600">
                                                <AlertCircle className="h-3 w-3" />
                                                {error?.message}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </form.Field>
                        </div>

                        <div>
                            <form.Field name="apiKey">
                                {(field) => (
                                    <div className="space-y-1">
                                        <Label htmlFor={field.name} className="text-xs">
                                            API Key
                                        </Label>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            type="password"
                                            placeholder="sk-..."
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            className={`h-8 text-sm ${field.state.meta.errors.length > 0
                                                ? "border-red-500 focus-visible:ring-red-500"
                                                : ""
                                                }`}
                                        />
                                        {field.state.meta.errors.map((error) => (
                                            <div key={error?.message} className="flex items-center gap-1 text-xs text-red-600">
                                                <AlertCircle className="h-3 w-3" />
                                                {error?.message}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </form.Field>
                        </div>

                        <div className="flex justify-end pt-2">
                            <form.Subscribe>
                                {(state) => (
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={!state.canSubmit || state.isSubmitting}
                                        className="h-8"
                                    >
                                        {state.isSubmitting ? "Adding..." : "Add"}
                                    </Button>
                                )}
                            </form.Subscribe>
                        </div>
                    </form>
                </div>
            </PopoverContent>
        </Popover>
    )
}