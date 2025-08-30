import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://threadway.co"),
  title: {
    default: "Threadway — Stop messaging yourself. Start messaging your assistant.",
    template: "%s | Threadway",
  },
  description:
    "Upgrade your WhatsApp notes-to-self habit with an AI assistant that organizes and automates everyday tasks. Works inside WhatsApp, no new app to learn.",
  keywords: [
    "WhatsApp",
    "MCP",
    "Model Context Protocol",
    "AI assistant",
    "automation",
    "LLM",
    "Gmail",
    "Calendar",
    "Notion",
    "personal automation",
    "notes to self",
    "everyday tasks",
    "personal productivity",
    "WhatsApp automation",
    "AI chat assistant",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://threadway.co/",
    title: "Threadway — Stop messaging yourself. Start messaging your assistant.",
    description:
      "Upgrade your WhatsApp notes-to-self habit with an AI assistant that organizes and automates everyday tasks. Works inside WhatsApp, no new app to learn.",
    images: [
      { url: "/placeholder.svg", width: 1200, height: 630, alt: "Threadway product preview" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Threadway — Stop messaging yourself. Start messaging your assistant.",
    description:
      "Upgrade your WhatsApp notes-to-self habit with an AI assistant that organizes and automates everyday tasks. Works inside WhatsApp, no new app to learn.",
    images: ["/placeholder.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-clip scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <Providers>
          <div className="">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
