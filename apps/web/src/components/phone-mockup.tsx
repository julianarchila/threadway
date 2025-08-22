"use client"


import * as React from "react"
import { cn } from "@/lib/utils"
import { ExternalLink, MessageCircle, Mic, Play, CheckCheck } from 'lucide-react'

type ChatLink = { href: string; title: string; host: string; label?: string }
type ListItem = { href: string; title: string; source: string; summary?: string }

type ChatMessage =
  | { id: string; from: "user" | "bot"; time?: string; type: "text"; text: string; delivered?: boolean }
  | { id: string; from: "bot"; time?: string; type: "link"; link: ChatLink; helper?: string }
  | { id: string; from: "user"; time?: string; type: "voice"; text: string; duration?: string; delivered?: boolean }
  | { id: string; from: "bot"; time?: string; type: "list"; text: string; items: ListItem[] }

export default function PhoneMockup() {
  const messages: ChatMessage[] = React.useMemo(
    () => [
      { id: "m1", from: "user", type: "text", text: "Hi", time: "09:41", delivered: true },
      {
        id: "m2",
        from: "bot",
        type: "text",
        text:
          "Welcome to Threadway! I can connect to your tools and help you act on them — all here in WhatsApp. Which integration would you like to link first?",
        time: "09:41",
      },
      { id: "m3", from: "user", type: "text", text: "Connect my Gmail", time: "09:41", delivered: true },
      { id: "m4", from: "bot", type: "text", text: "Secure link for Gmail OAuth.", time: "09:41" },
      {
        id: "m5",
        from: "bot",
        type: "link",
        link: {
          href: "https://accounts.google.com/o/oauth2/v2/auth",
          title: "Open link",
          host: "accounts.google.com",
          label: "Secure OAuth",
        },
        helper: "Opens in your browser",
        time: "09:41",
      },
      { id: "m6", from: "bot", type: "text", text: "Gmail linked", time: "09:42" },
      {
        id: "m7",
        from: "user",
        type: "text",
        text: "Schedule a 30 min call with Ana next Tuesday",
        time: "09:42",
        delivered: true,
      },
      { id: "m8", from: "bot", type: "text", text: 'Created "Call with Ana" on Tue 10:00–10:30. Invite sent.', time: "09:42" },
      { id: "m9", from: "user", type: "voice", text: "Send my last invoice to Laura.", duration: "0:07", time: "09:43", delivered: true },
      {
        id: "m10",
        from: "bot",
        type: "text",
        text: "Drafted and emailed the invoice to Laura. Here’s a copy for your records.",
        time: "09:43",
      },
      { id: "m11", from: "user", type: "text", text: "Find me the latest news on electric cars", time: "09:44", delivered: true },
      {
        id: "m12",
        from: "bot",
        type: "list",
        text: "Here are 3 fresh links with summaries. Want me to send a daily briefing?",
        items: [
          {
            href: "https://example.com/ev-innovation",
            title: "EV battery innovations cut charging to 10 minutes",
            source: "TechDaily",
            summary: "New anode chemistry promises faster charging and longer cycle life.",
          },
          {
            href: "https://example.com/auto-policy",
            title: "EU considers expanded EV incentives through 2026",
            source: "PolicyWatch",
            summary: "Draft bill aims to accelerate adoption and expand charging access.",
          },
          {
            href: "https://example.com/market-report",
            title: "Global EV sales up 28% YoY in Q2",
            source: "MarketReport",
            summary: "Asia leads growth; premium segment outpaces entry-level models.",
          },
        ],
        time: "09:44",
      },
    ],
    []
  )

  // Scroll container ref (no auto-scroll on mount)
  const listRef = React.useRef<HTMLDivElement | null>(null)

  return (
    <div className="relative mx-auto w-full max-w-[460px]">
      {/* Ambient glow backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-6 h-48 w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.22),transparent_60%)] blur-2xl" />
        <div className="absolute -left-16 top-40 h-44 w-44 rounded-full bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.18),transparent_60%)] blur-xl" />
        <div className="absolute -right-20 top-64 h-48 w-56 rounded-[40%] bg-[radial-gradient(ellipse_at_center,rgba(5,150,105,0.18),transparent_60%)] blur-xl" />
      </div>

      {/* Device frame — responsive */}
      <div className="relative mx-auto aspect-[320/660] w-full max-w-[400px] rounded-[2.35rem] border border-black/10 bg-neutral-900 shadow-2xl ring-1 ring-black/10">
        {/* Specular highlight */}
        <div aria-hidden className="absolute inset-x-6 top-0 h-10 rounded-b-[2rem] bg-gradient-to-b from-white/10 to-transparent" />
        {/* Gradient bezel glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[2.35rem] ring-2 ring-transparent [background:linear-gradient(145deg,rgba(16,185,129,0.3),rgba(20,184,166,0.25))_padding-box,linear-gradient(145deg,rgba(255,255,255,0.6),rgba(0,0,0,0.08))_border-box]" />
        {/* Notch */}
        <div aria-hidden className="absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-black/70" />
        {/* Screen */}
        <div className="absolute inset-[10px] overflow-hidden rounded-[1.9rem] bg-neutral-50 dark:bg-neutral-900 ring-1 ring-black/10 dark:ring-white/10">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 border-b bg-white/75 dark:bg-neutral-800/75 px-3 py-2 backdrop-blur">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-600 text-[11px] font-semibold text-white">T</div>
              <div className="flex-1">
                <div className="text-sm font-semibold">Threadway</div>
                <div className="text-[10px] text-muted-foreground">online</div>
              </div>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Messages */}
            <div
              ref={listRef}
              className={cn(
                "relative flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4",
                "scroll-smooth",
                // Hide scrollbar on WebKit
                "[&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:bg-transparent",
                // Wallpaper
                "bg-[radial-gradient(60%_40%_at_20%_0%,rgba(16,185,129,0.10),transparent_60%),radial-gradient(50%_50%_at_90%_10%,rgba(20,184,166,0.08),transparent_60%)]"
              )}
            >
              {/* Date pill with dividers */}
              <div className="relative my-1 grid place-items-center">
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />
                <div className="relative rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-800/70 px-3 py-1 text-[11px] text-muted-foreground shadow-sm backdrop-blur">
                  Today
                </div>
              </div>

              {messages.map((m, idx) => {
                const prev = messages[idx - 1]
                const isUser = m.from === "user"
                const isFirstInGroup = !prev || prev.from !== m.from
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "flex w-full",
                      isUser ? "justify-end" : "justify-start",
                      "motion-safe:tw-fade-in-up"
                    )}
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    {/* Optional avatar for bot at group start */}
                    {!isUser && isFirstInGroup && (
                      <div
                        className="mr-2 mt-5 hidden h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-semibold text-white sm:flex"
                        aria-hidden
                      >
                        T
                      </div>
                    )}

                    <div
                      className={cn(
                        "relative max-w-[86%] whitespace-pre-line text-[13px] leading-relaxed sm:max-w-[78%] sm:text-sm"
                      )}
                    >
                      {/* Bubble */}
                      <div
                        className={cn(
                          "group relative rounded-3xl shadow-sm ring-1",
                          isUser
                            ? "rounded-br-md bg-[linear-gradient(135deg,#059669,#10b981)] text-white ring-white/0"
                            : "rounded-bl-md bg-white/95 dark:bg-neutral-800/95 text-foreground ring-black/5 dark:ring-white/5 backdrop-blur"
                        )}
                      >
                        {/* Gloss highlight on user bubble */}
                        {isUser && (
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 rounded-3xl opacity-20 [background:linear-gradient(180deg,rgba(255,255,255,0.7),transparent_35%)]"
                          />
                        )}
                        {/* Bubble tail */}
                        <span
                          aria-hidden
                          className={cn(
                            "pointer-events-none absolute bottom-0 h-3 w-3 translate-y-1",
                            isUser
                              ? "right-0 [clip-path:polygon(100%_0,0_0,100%_100%)] bg-emerald-600"
                              : "left-0 [clip-path:polygon(0_0,0_100%,100%_100%)] bg-white/95 dark:bg-neutral-800/95"
                          )}
                        />
                        <div className="relative px-3.5 py-2.5">
                          {m.type === "text" && <p className="tracking-[0.005em]">{m.text}</p>}

                          {m.type === "link" && (
                            <LinkCard link={(m as any).link} helper={(m as any).helper} />
                          )}

                          {m.type === "voice" && (
                            <VoiceNote text={(m as any).text} duration={(m as any).duration} inverted={isUser} />
                          )}

                          {m.type === "list" && (
                            <div className="space-y-2">
                              <p className="tracking-[0.005em]">{(m as any).text}</p>
                              <div className="mt-1 grid gap-2">
                                {(m as any).items.map((item: ListItem, i: number) => (
                                  <a
                                    key={i}
                                    href={item.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group/link rounded-xl border border-emerald-200/80 dark:border-emerald-700/50 bg-emerald-50/70 dark:bg-emerald-900/20 p-3 ring-emerald-200/60 dark:ring-emerald-700/40 transition-all hover:-translate-y-[1px] hover:bg-emerald-100/80 dark:hover:bg-emerald-900/30 hover:shadow-sm"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="font-medium text-emerald-900 dark:text-emerald-100">{item.title}</div>
                                      <ExternalLink className="mt-0.5 h-4 w-4 text-emerald-800/80 dark:text-emerald-200/80 opacity-80 group-hover/link:opacity-100" />
                                    </div>
                                    <div className="mt-0.5 text-[11px] text-emerald-900/70 dark:text-emerald-100/70">{item.source}</div>
                                    {item.summary && (
                                      <div className="mt-1 text-[12px] text-emerald-900/80 dark:text-emerald-100/80">{item.summary}</div>
                                    )}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className={cn("mt-1 flex items-center gap-1 text-[10px]")}>
                            <span className={isUser ? "text-emerald-50/85" : "text-muted-foreground"}>{m.time}</span>
                            {isUser && (m as any).delivered && (
                              <CheckCheck className="h-3.5 w-3.5 text-emerald-50/85" aria-label="Delivered" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Composer — glassy with blur */}
            <div className="flex items-center gap-2 border-t bg-white/70 dark:bg-neutral-800/70 px-2 py-2 backdrop-blur">
              <div className="flex-1 rounded-full border border-black/10 dark:border-white/10 bg-white/85 dark:bg-neutral-700/85 px-3 py-2 text-xs text-muted-foreground shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]">
                Type a message
              </div>
              <Mic className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .tw-fade-in-up {
          animation: fadeInUp 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
    </div>
  )
}

function LinkCard({ link, helper }: { link: ChatLink; helper?: string }) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "block rounded-xl border p-3 ring-1 transition-all",
        "border-emerald-200/80 dark:border-emerald-700/50 bg-emerald-50/70 dark:bg-emerald-900/20 ring-emerald-200/60 dark:ring-emerald-700/40",
        "hover:-translate-y-[1px] hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:shadow-sm"
      )}
      aria-label={`${link.title} on ${link.host}`}
    >
      <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
        <ExternalLink className="h-4 w-4" />
        <span className="font-medium">{link.title}</span>
      </div>
      <div className="mt-1 text-[11px] text-emerald-900/75 dark:text-emerald-100/75">
        {link.host} {link.label ? "• " + link.label : ""}
      </div>
      {helper ? <div className="mt-2 text-[11px] text-emerald-900/70 dark:text-emerald-100/70">{helper}</div> : null}
    </a>
  )
}

function VoiceNote({
  text,
  duration = "0:06",
  inverted = false,
}: {
  text: string
  duration?: string
  inverted?: boolean
}) {
  return (
    <div className="space-y-2">
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px]",
          inverted ? "bg-white/20 text-white" : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100"
        )}
      >
        <Mic className={cn("h-3.5 w-3.5", inverted ? "text-white" : "text-emerald-700 dark:text-emerald-300")} />
        <span>Voice note</span>
        <span aria-hidden>•</span>
        <span>{duration}</span>
      </div>
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg p-2 ring-1",
          inverted ? "ring-white/25" : "ring-emerald-200 dark:ring-emerald-700 bg-emerald-50/60 dark:bg-emerald-900/30"
        )}
      >
        <button
          type="button"
          aria-label="Play voice note"
          className={cn(
            "grid h-7 w-7 place-items-center rounded-full transition-colors",
            inverted ? "bg-white/25 text-white hover:bg-white/30" : "bg-emerald-600 text-white hover:bg-emerald-700"
          )}
        >
          <Play className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <div className="flex h-6 items-end gap-0.5">
            {Array.from({ length: 28 }).map((_, i) => (
              <span
                key={i}
                className={cn("w-0.5 rounded-[1px]", inverted ? "bg-white/75" : "bg-emerald-700/70 dark:bg-emerald-300/70")}
                style={{ height: `${3 + ((i * 7) % 18)}px` }}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="tracking-[0.005em]">{text}</p>
    </div>
  )
}
