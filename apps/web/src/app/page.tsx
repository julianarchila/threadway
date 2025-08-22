import NextLink from "next/link"
import PhoneMockup from "@/components/phone-mockup"
import { ArrowRight, Check, ChevronRight, MessageCircle, Mic, Calendar, Globe2, ShieldCheck, Zap, Bot, Mail, TerminalSquare, Star, Lock, ExternalLink, Wrench, Network, Link2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import ThemeToggle from "@/components/theme-toggle"

const WA_URL = `https://wa.me/message/RZEXMJPBWCZRG1`

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Threadway",
  applicationCategory: "BusinessApplication",
  description:
    "Turn WhatsApp into your AI command center. Connect Gmail, Calendar, Notion & more via MCP. Send emails, schedule meetings, and automate tasks with voice or text — no app, no passwords. Start free.",
  url: "https://threadway.co",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
}

function Header() {
  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <NextLink
      href={href}
      className="group relative px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
      <span className="absolute inset-x-1 -bottom-1 h-px origin-left scale-x-0 bg-gradient-to-r from-emerald-400 to-teal-400 transition-transform group-hover:scale-x-100" />
    </NextLink>
  )
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto max-w-7xl px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <NextLink href="#top" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-sm">
              <span className="text-sm font-bold">T</span>
            </div>
            <span className="font-semibold tracking-tight">Threadway</span>
          </NextLink>
          <nav className="hidden items-center gap-5 md:flex">
            <NavLink href="#how-it-works">How it works</NavLink>
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="#security">Security</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline" className="hidden md:inline-flex">
              <NextLink href="#how-it-works">
                See how it works
                <ChevronRight className="ml-1 h-4 w-4" />
              </NextLink>
            </Button>
            <ThemeToggle />
            <Button
              asChild
              size="sm"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-[0_8px_24px_-8px_rgba(16,185,129,0.65)] transition-transform hover:scale-[1.01] hover:from-emerald-600 hover:to-teal-600"
            >
              <a href={WA_URL} target="_blank" rel="noreferrer">
                Start on WhatsApp
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

function AmbientHeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/2 top-[-120px] h-[700px] w-[1200px] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.18),rgba(20,184,166,0.10),transparent_60%)] blur-0" />
      <div className="absolute -left-24 top-40 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.20),transparent_60%)] blur-2xl" />
      <div className="absolute -right-32 top-80 h-[520px] w-[520px] rounded-[60%] bg-[radial-gradient(ellipse_at_center,rgba(5,150,105,0.18),transparent_60%)] blur-2xl" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,transparent,rgba(255,255,255,0.6)_12%,transparent_32%)] opacity-40 dark:opacity-20" />
    </div>
  )
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <AmbientHeroBackground />
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 md:pb-24 md:pt-16">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50/60 px-2.5 py-1 text-xs text-emerald-900 backdrop-blur dark:border-emerald-400/30 dark:bg-emerald-950/40 dark:text-emerald-200">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              No passwords • Start in WhatsApp
            </div>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              The easiest way to use AI and all your tools — right inside WhatsApp
            </h1>
            <p className="mt-4 text-pretty text-muted-foreground">
              Talk to AI, connect Gmail, Calendar, Notion, and automate work — no new apps, no passwords. Start in 60 seconds.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-[0_16px_40px_-12px_rgba(16,185,129,0.65)] transition-transform hover:scale-[1.01]"
              >
                <a href={WA_URL} target="_blank" rel="noreferrer" aria-label="Start on WhatsApp">
                  Start on WhatsApp
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="backdrop-blur">
                <NextLink href="#how-it-works">See how it works</NextLink>
              </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Use AI to do things — send emails, schedule meetings, search, and automate — all in one WhatsApp chat.
            </p>

            <div className="mt-6 grid w-full gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <div className="flex items-center gap-2 rounded-md border border-emerald-200/50 bg-emerald-50/50 px-3 py-2 dark:border-emerald-400/20 dark:bg-emerald-950/30">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                OAuth 2.0 connections
              </div>
              <div className="flex items-center gap-2 rounded-md border border-emerald-200/50 bg-emerald-50/50 px-3 py-2 dark:border-emerald-400/20 dark:bg-emerald-950/30">
                <Globe2 className="h-4 w-4 text-emerald-600" />
                40+ languages
              </div>
              <div className="flex items-center gap-2 rounded-md border border-emerald-200/50 bg-emerald-50/50 px-3 py-2 dark:border-emerald-400/20 dark:bg-emerald-950/30">
                <Mic className="h-4 w-4 text-emerald-600" />
                Voice notes supported
              </div>
            </div>
          </div>
          <div className="relative">
            {/* Glow behind the phone */}
            <div aria-hidden className="absolute left-1/2 top-6 -z-10 h-40 w-60 -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.36),transparent_60%)] blur-2xl" />
            <div className="transition-transform duration-700 ease-out motion-safe:hover:-translate-y-1 motion-reduce:transform-none">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SectionHeader({
  title,
  subtitle,
  eyebrow,
  id,
  center = false,
}: {
  title: string
  subtitle?: string
  eyebrow?: string
  id?: string
  center?: boolean
}) {
  return (
    <div id={id} className={cn("mx-auto", center ? "max-w-2xl text-center" : "max-w-2xl")}>
      {eyebrow && (
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50/60 px-2.5 py-1 text-xs text-emerald-900 backdrop-blur dark:border-emerald-400/30 dark:bg-emerald-950/40 dark:text-emerald-200">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
          {eyebrow}
        </div>
      )}
      <h2 className={cn("mt-2 text-3xl font-semibold tracking-tight sm:text-4xl", center && "mx-auto")}>{title}</h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  )
}

function HowItWorks() {
  const steps = [
    {
      icon: MessageCircle,
      title: "Say hi on WhatsApp",
      desc: "Your phone number is your account. No forms, no passwords—just a chat.",
    },
    {
      icon: Link2,
      title: "Connect tools with one tap",
      desc: "Threadway drops secure OAuth links right in the thread. Approve in your browser, return to chat.",
    },
    {
      icon: Bot,
      title: "Ask. It acts.",
      desc: '"Email my last invoice to Laura." "Schedule a 30‑min call next Tuesday." "Summarize my day."',
    },
  ]

  return (
    <section id="how-it-works" className="relative">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <SectionHeader
          center
          title="How it works"
          subtitle="Onboard in under two minutes, connect services when you need them, and handle everything in one persistent WhatsApp thread."
        />
        {/* Timeline on mobile, cards on larger screens */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <Card key={i} className="border-muted/60 transition-all motion-safe:hover:-translate-y-[2px] hover:shadow-md">
              <CardHeader>
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 ring-1 ring-inset ring-emerald-300/40 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-200 dark:ring-emerald-500/20">
                  <s.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{s.title}</CardTitle>
                <CardDescription>{s.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="mt-8 grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-emerald-600" />
            Voice‑first: send a voice note, Threadway transcribes and acts.
          </div>
          <div className="flex items-center gap-2">
            <TerminalSquare className="h-4 w-4 text-emerald-600" />
            In‑chat commands: /plan, /quota, /forgetme, /help
          </div>
        </div>
      </div>
    </section>
  )
}

function ValueForAll() {
  const bullets = [
    { icon: Mail, text: "Send emails, replies, and summaries without opening your inbox." },
    { icon: Calendar, text: "Schedule meetings, reminders, and daily briefings in seconds." },
    { icon: Globe2, text: "Chat naturally in 40+ languages—no special syntax required." },
    { icon: Wrench, text: "Power users: bring your MCP tools—configure, test, and invoke by name." },
  ]
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeader
              title="Simple for everyone. Powerful for experts."
              subtitle="If you've ever texted a human assistant, you already know how to use Threadway. And if you know MCP, you'll love how fast it is to wire up tools and invoke them directly from WhatsApp."
            />
            <ul className="mt-6 grid gap-3">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 rounded-md bg-gradient-to-br from-emerald-100 to-teal-100 p-1.5 text-emerald-700 ring-1 ring-inset ring-emerald-300/40 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-200 dark:ring-emerald-500/20">
                    <b.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm">{b.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Button
                asChild
                className="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-[0_12px_28px_-12px_rgba(16,185,129,0.65)] transition-transform hover:scale-[1.01]"
              >
                <a href={WA_URL} target="_blank" rel="noreferrer">
                  Start on WhatsApp
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
          <Card className="overflow-hidden border-border bg-card">
            <CardHeader>
              <CardTitle>What is MCP?</CardTitle>
              <CardDescription>
                Model Context Protocol (MCP) is an open standard for letting AI models securely "think and act" with
                external tools—like your email, calendar, docs, repos, and internal APIs—without hard‑coding integrations
                into a single app.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
                <span>Bring any MCP‑compatible connector. Configure once, invoke from WhatsApp by name.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
                <span>Threadway handles auth and execution, the LLM handles intent and content.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
                <span>Power users can optionally manage connectors in a lightweight web dashboard.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    { icon: MessageCircle, title: "WhatsApp‑native", desc: "Stay in the app you use every day. One persistent thread for everything." },
    { icon: Lock, title: "Secure OAuth 2.0", desc: "One‑tap links in chat. Approve in your browser—no passwords shared in WhatsApp." },
    { icon: Mic, title: "Voice notes", desc: "Record and go. We transcribe and act on your request automatically." },
    { icon: Calendar, title: "Automations", desc: "Recurring reminders and daily briefings delivered right in chat." },
    { icon: Globe2, title: "Multilingual", desc: "40+ languages supported and accessible from the first message." },
    { icon: TerminalSquare, title: "In‑chat commands", desc: "/plan, /quota, /forgetme, /help—no dashboard required." },
    { icon: Network, title: "Open MCP layer", desc: "Connect Gmail, Calendar, Notion, GitHub, CRMs, and internal tools." },
    { icon: Zap, title: "Fast onboarding", desc: "Say hi and you're in. Phone‑number authentication—no sign‑up flow." },
  ]
    return (
    <section id="features" className="relative">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <SectionHeader center title="Features" subtitle="Everything you expect from a real assistant—powered by LLMs and your tools." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((f, i) => (
            <Card
              key={i}
              className="border-muted/60 transition-all motion-safe:hover:-translate-y-[2px] hover:shadow-md hover:shadow-emerald-100 dark:hover:shadow-emerald-900/30"
            >
              <CardHeader className="pb-2">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 ring-1 ring-inset ring-emerald-300/40 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-200 dark:ring-emerald-500/20">
                  <f.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{f.title}</CardTitle>
                <CardDescription>{f.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      blurb: "Get started in minutes.",
      features: ["30 messages / month", "Up to 3 MCP connectors", "Voice notes", "In‑chat commands"],
      cta: "Start on WhatsApp",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$12",
      suffix: "/month",
      blurb: "For busy individuals.",
      features: ["500 messages / month", "Up to 5 MCP connectors", "Automations & briefings", "Priority queueing"],
      cta: "Start on WhatsApp",
      highlight: true,
    },
    {
      name: "Power",
      price: "$39",
      suffix: "/month",
      blurb: "For power users and teams.",
      features: ["Unlimited messages", "Unlimited MCP connectors", "Priority support", "Advanced rate limits"],
      cta: "Start on WhatsApp",
      highlight: false,
    },
  ]
  return (
    <section id="pricing" className="relative">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <SectionHeader center title="Pricing" subtitle='Upgrade in chat with /plan. Cancel anytime.' />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
                className={cn(
                  "relative flex flex-col border-muted/60 transition-all motion-safe:hover:-translate-y-[2px] hover:shadow-lg",
                  plan.highlight && "border-emerald-300/80 shadow-[0_0_0_1px_rgba(16,185,129,0.25)] dark:border-emerald-500/50 dark:shadow-[0_0_0_1px_rgba(16,185,129,0.35)]"
                )}
            >
              {plan.highlight && (
                <div className="absolute right-3 top-3 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                  Most popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.blurb}</CardDescription>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.suffix ?? ""}</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="mb-6 mt-2 grid gap-2 text-sm">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <Check className="mt-1 h-4 w-4 text-emerald-600" /> <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <p className="mb-4 text-xs text-muted-foreground">
                  A message is any LLM request or assistant action. Voice notes count as 1 message each.
                </p>
                <Button
                  asChild
                  className={cn(
                    "mt-auto transition-transform motion-safe:hover:scale-[1.01]",
                    "bg-gradient-to-r from-emerald-600 to-teal-600"
                  )}
                >
                  <a href={WA_URL} target="_blank" rel="noreferrer">
                    {plan.cta}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Billing handled via secure links shared in chat. Taxes may apply. Message limits reset monthly.
        </p>
      </div>
    </section>
  )
}

function SecurityPrivacy() {
  const items = [
    { title: "OAuth 2.0", desc: "Connect services using standard OAuth flows from links sent in chat.", icon: ShieldCheck },
    { title: "Encrypted tokens", desc: "Access tokens stored securely server‑side. No secrets live on your device.", icon: Lock },
    { title: "/forgetme", desc: "Delete your data and revoke integrations at any time, right from WhatsApp.", icon: TerminalSquare },
  ]
  return (
    <section id="security" className="relative">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <div className="grid items-start gap-8 md:grid-cols-2">
          <div>
            <SectionHeader
              title="Security & Privacy"
              subtitle="Threadway is designed to keep your credentials and actions safe while letting you work entirely from WhatsApp."
            />
            <div className="mt-6 grid gap-4">
              {items.map((it, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-muted/60 bg-muted/30 p-3">
                  <div className="rounded-md bg-gradient-to-br from-emerald-100 to-teal-100 p-1.5 text-emerald-700 ring-1 ring-inset ring-emerald-300/40 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-200 dark:ring-emerald-500/20">
                    <it.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{it.title}</div>
                    <p className="text-sm text-muted-foreground">{it.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Policies</CardTitle>
              <CardDescription>We'll publish full policy docs before GA. For now, here are placeholders.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <NextLink href="/privacy" className="text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300">
                Privacy Policy (placeholder)
              </NextLink>
              <NextLink href="/terms" className="text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300">
                Terms of Service (placeholder)
              </NextLink>
              <NextLink href="/security" className="text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300">
                Security Overview (placeholder)
              </NextLink>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  const quotes = [
    {
      name: "María G.",
      role: "Freelance Designer",
      text: "I just text 'send the invoice' and it's done. No tabs, no context switching. It feels like magic.",
      stars: 5,
      img: "/placeholder.svg?height=80&width=80",
    },
    {
      name: "Ethan W.",
      role: "Ops Lead",
      text: "Hooked up Gmail, Calendar, and Notion in a single morning. The MCP flow from WhatsApp is shockingly smooth.",
      stars: 5,
      img: "/placeholder.svg?height=80&width=80",
    },
    {
      name: "Priya S.",
      role: "Founder",
      text: "Voice note → calendar invite → follow‑up email. One thread. Threadway is my new command center.",
      stars: 5,
      img: "/placeholder.svg?height=80&width=80",
    },
  ]
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <SectionHeader center title="Loved by early users" subtitle="From newcomers to MCP power users." />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {quotes.map((q, i) => (
            <Card
              key={i}
              className="border-muted/60 transition-all motion-safe:hover:-translate-y-[2px] hover:shadow-md hover:shadow-emerald-100 dark:hover:shadow-emerald-900/30"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                    <AvatarImage src={q.img || "/placeholder.svg"} alt={`${q.name} avatar`} loading="lazy" />
                    <AvatarFallback>{q.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">{q.name}</div>
                    <div className="text-xs text-muted-foreground">{q.role}</div>
                  </div>
                </div>
                <div className="mb-3 flex gap-1 text-emerald-600">
                  {Array.from({ length: q.stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-emerald-600" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed">"{q.text}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function DashboardPlaceholder() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeader
              title="Optional MCP Dashboard"
              subtitle="Power users can log in to a lightweight web dashboard to browse connectors, set credentials, test calls, and view usage. Once configured, invoke each connector by name directly in WhatsApp."
            />
            <ul className="mt-6 grid gap-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" /> Browse & test MCP connectors
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" /> Configure API keys & parameters
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" /> Monitor logs & quotas
              </li>
            </ul>
          </div>
          <Card className="overflow-hidden border-border bg-card">
            <CardHeader>
              <CardTitle>Dashboard diagram</CardTitle>
              <CardDescription>Placeholder image—drop your diagram here later.</CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src="/placeholder.svg?height=400&width=700"
                alt="Diagram placeholder showing how the optional MCP dashboard connects tools"
                className="w-full rounded-md border"
                loading="lazy"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

function FAQ() {
  const faqs = [
    { q: "Do I need to install an app?", a: "No. Threadway lives inside WhatsApp. Say hi to get started." },
    {
      q: "How do I connect services like Gmail or Calendar?",
      a:
        "When you ask for something that needs access, Threadway sends a secure OAuth link in the chat. Approve in your browser, then come back to WhatsApp.",
    },
    { q: "What are in‑chat commands?", a: "Use /plan to manage your plan, /quota to see remaining messages, /forgetme to delete your data, and /help for a command list." },
    { q: "Is my data safe?", a: "Yes. We use standard OAuth for access and encrypted server‑side token storage. You can revoke and delete at any time with /forgetme." },
    { q: "What is MCP?", a: "The Model Context Protocol lets AI safely interact with external tools like email, calendars, docs, repos, and internal APIs. Threadway supports any MCP‑compatible connector." },
    { q: "Does it work with voice notes?", a: "Yes. Record a voice note and Threadway will transcribe, run your request, and return results in the same thread." },
  ]
  return (
    <section id="faq" className="relative">
      <div className="mx-auto max-w-3xl px-4 py-16 md:py-20">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">FAQ</h2>
        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

function CallToActionBand() {
  return (
    <section className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-72 w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.18),transparent_60%)] blur-2xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-2">
        <Card className="overflow-hidden border-border bg-card">
          <CardContent className="flex flex-col items-center justify-between gap-4 p-6 md:flex-row md:gap-6">
            <div>
              <h3 className="text-xl font-semibold">Ready to try Threadway?</h3>
              <p className="text-sm text-muted-foreground">Say hi on WhatsApp and get started in under two minutes.</p>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-[0_12px_28px_-12px_rgba(16,185,129,0.65)] transition-transform hover:scale-[1.01]"
            >
              <a href={WA_URL} target="_blank" rel="noreferrer">
                Start on WhatsApp
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="relative border-t">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-sm">
              <span className="text-sm font-bold">T</span>
            </div>
            <div>
              <div className="font-semibold tracking-tight">Threadway</div>
              <div className="text-xs text-muted-foreground">support@threadway.co</div>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <NextLink href="#how-it-works" className="hover:text-foreground">
              How it works
            </NextLink>
            <NextLink href="#features" className="hover:text-foreground">
              Features
            </NextLink>
            <NextLink href="#pricing" className="hover:text-foreground">
              Pricing
            </NextLink>
            <NextLink href="#security" className="hover:text-foreground">
              Security
            </NextLink>
            <NextLink href="#faq" className="hover:text-foreground">
              FAQ
            </NextLink>
            <NextLink href="/privacy" className="hover:text-foreground">
              Privacy
            </NextLink>
            <NextLink href="/terms" className="hover:text-foreground">
              Terms
            </NextLink>
          </nav>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col-reverse items-start justify-between gap-4 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Threadway. All rights reserved.</p>
          <p>Not affiliated with WhatsApp. WhatsApp is a trademark of its respective owner.</p>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <main className="bg-background">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <Hero />
      <HowItWorks />
      <ValueForAll />
      <Features />
      <Pricing />
      <SecurityPrivacy />
      <Testimonials />
      <DashboardPlaceholder />
      <FAQ />
      <CallToActionBand />
      <Footer />
    </main>
  )
}
