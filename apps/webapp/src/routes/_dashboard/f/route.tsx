import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar'
import Chatbot from '@/components/chatbot'

export const Route = createFileRoute('/_dashboard/f')({
  component: RouteComponent,
})

function RouteComponent() {
  const [showChatSidebar, setShowChatSidebar] = useState(false)

  useEffect(() => {
    function handleOpen() {
      setShowChatSidebar(true)
    }
    window.addEventListener('open-chat', handleOpen as EventListener)
    return () => {
      window.removeEventListener('open-chat', handleOpen as EventListener)
    }
  }, [])

  return <>
    <div className="flex-1 p-4 relative">
      <Outlet />
    </div>

    {showChatSidebar && (
      <Sidebar 
        side="right" 
        className="w-96 min-w-[320px] max-w-[400px]"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          zIndex: 50,
          backgroundColor: 'hsl(var(--background))',
          borderLeft: '1px solid hsl(var(--border))',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
        }}
      >
        <SidebarHeader className="p-3 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold truncate">AI Assistant</h2>
            <button
              onClick={() => {
                setShowChatSidebar(false)
                window.dispatchEvent(new CustomEvent('close-chat'))
              }}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-0 flex flex-col h-full">
          <div className="flex-1 min-h-0 overflow-hidden">
            <Chatbot />
          </div>
        </SidebarContent>
      </Sidebar>
    )}
  </>
}
