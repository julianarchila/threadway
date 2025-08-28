"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation"

import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
} from "convex/react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function DasshboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;

}>) {

  function UnauthRedirect() {
    const router = useRouter();
    useEffect(() => {
      const next = window.location.pathname + window.location.search + window.location.hash;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }, [router]);
    return null;
  }

  return (
    <>
      <AuthLoading>
        <div>Loading...</div>
      </AuthLoading>
      <Unauthenticated>
        <UnauthRedirect />
      </Unauthenticated>
      <Authenticated>
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 flex flex-col min-h-screen">
            <div className="flex items-center p-4 border-b">
              <SidebarTrigger />
            </div>
            <div className="flex-1 p-4">
              {children}
            </div>
          </main>
        </SidebarProvider>

      </Authenticated>
    </>
  )
}
