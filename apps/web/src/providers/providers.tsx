"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "../components/ui/sonner";
import { ConvexClientProvider } from "./ConvexClientProvider";


export default function Providers({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ConvexClientProvider>
        {children}
      </ConvexClientProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
