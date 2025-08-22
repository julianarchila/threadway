import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";
import Header from "@/components/header";

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
    default: "Threadway — Use AI & your tools inside WhatsApp (Gmail, Calendar, Notion)",
    template: "%s | Threadway",
  },
  description:
    "Turn WhatsApp into your AI command center. Connect Gmail, Calendar, Notion & more via MCP. Send emails, schedule meetings, and automate tasks with voice or text — no app, no passwords. Start free.",
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
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://threadway.co/",
    title: "Threadway — Use AI & your tools inside WhatsApp (Gmail, Calendar, Notion)",
    description:
      "Turn WhatsApp into your AI command center. Connect Gmail, Calendar, Notion & more via MCP. Send emails, schedule meetings, and automate tasks with voice or text — no app, no passwords. Start free.",
    images: [
      { url: "/placeholder.svg", width: 1200, height: 630, alt: "Threadway product preview" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Threadway — Use AI & your tools inside WhatsApp (Gmail, Calendar, Notion)",
    description:
      "Turn WhatsApp into your AI command center. Connect Gmail, Calendar, Notion & more via MCP. Send emails, schedule meetings, and automate tasks with voice or text — no app, no passwords. Start free.",
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
    <html lang="en" suppressHydrationWarning className="overflow-x-clip">
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
