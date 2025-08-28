import NextLink from "next/link"
import PhoneMockup from "@/components/landing/phone-mockup"
import WaitlistForm from "../components/landing/waitlist-form"
import { ArrowRight, Check, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import ThemeToggle from "@/components/theme-toggle"

// Waitlist UI only for now; link CTAs to #waitlist

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Threadway",
  applicationCategory: "BusinessApplication",
  description:
    "Stop messaging yourself. Start messaging your assistant. Threadway upgrades your WhatsApp notes-to-self habit with an AI assistant that organizes and automates everyday tasks.",
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
            <NavLink href="#why-threadway">Why Threadway</NavLink>
            <NavLink href="#how-it-works">How it works</NavLink>
            <NavLink href="#use-cases">Use cases</NavLink>
            <NavLink href="#love">Why people love it</NavLink>
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
              <NextLink href="#waitlist">
                Join the Waitlist
                <ArrowRight className="ml-1 h-4 w-4" />
              </NextLink>
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
              Works inside WhatsApp • No new app
            </div>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Stop messaging yourself. Start messaging your assistant.
            </h1>
            <p className="mt-4 text-pretty text-muted-foreground">
              Many of us use WhatsApp as a notes-to-self pad — expenses, reminders, links. Threadway upgrades that habit with an AI assistant that organizes and automates everything for you.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Threadway is coming soon. Join the waitlist to be the first to try it.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-[0_16px_40px_-12px_rgba(16,185,129,0.65)] transition-transform hover:scale-[1.01]"
              >
                <NextLink href="#waitlist" aria-label="Join the Waitlist">
                  Join the Waitlist
                  <ArrowRight className="ml-2 h-5 w-5" />
                </NextLink>
              </Button>
              <Button asChild size="lg" variant="outline" className="backdrop-blur">
                <NextLink href="#how-it-works">See how it works</NextLink>
              </Button>
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

function WhyThreadway() {
  return (
    <section id="why-threadway" className="relative">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <SectionHeader
          center
          title="You already use WhatsApp this way. We just make it smarter."
        />
        <div className="mx-auto mt-6 max-w-2xl text-muted-foreground">
          <p>
            Everyone has a self-chat in WhatsApp. A place where you:
          </p>
          <ul className="mt-4 grid gap-2 text-sm">
            <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> Save quick notes.</li>
            <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> Jot down what you spent.</li>
            <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> Share links for later.</li>
            <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> Remind yourself of things to do.</li>
          </ul>
          <p className="mt-4">
            Threadway takes that same chat and turns it into a powerful personal assistant that organizes, tracks, and remembers — automatically.
          </p>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      title: "Connect your apps",
      desc: "Link Google Sheets, Notion, Gmail, and more from your Threadway dashboard.",
    },
    {
      title: "Describe what you want in text",
      desc: "Just explain your workflow in plain language. We turn your words into ready-to-use automations.",
    },
    {
      title: "Trigger with WhatsApp",
      desc: "Send a message to your personal Threadway bot. The automation runs instantly.",
    },
  ]

  return (
    <section id="how-it-works" className="relative">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <SectionHeader center title="How it works" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <Card key={i} className="border-muted/60 transition-all motion-safe:hover:-translate-y-[2px] hover:shadow-md">
              <CardHeader>
                <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 ring-1 ring-inset ring-emerald-300/40 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-200 dark:ring-emerald-500/20">
                  <span className="text-sm font-semibold">{i + 1}</span>
                </div>
                <CardTitle className="text-lg">{s.title}</CardTitle>
                <CardDescription>{s.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function EverydayUseCases() {
  return (
    <section id="use-cases" className="relative">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <SectionHeader center title="Automations for everyday life." subtitle="Threadway helps you with simple, useful workflows:" />
        <div className="mx-auto mt-6 max-w-2xl">
          <ul className="grid gap-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> Track spending – Text “Bought lunch $12” → saved & categorized in Sheets.</li>
            <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> Save content for later – Share a link → neatly stored in Notion with tags.</li>
            <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> Log workouts or habits – “Pushups 20” → recorded in your log.</li>
            <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> Smart reminders – “Remind me to call mom Friday 6pm” → done.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

function WhyPeopleLoveIt() {
  const points = [
    { title: "Familiar", desc: "Works inside WhatsApp, no new app to learn." },
    { title: "Effortless", desc: "If you can chat, you can automate." },
    { title: "Personal-first", desc: "Focused on your daily life, not work processes." },
    { title: "AI-powered help", desc: "The chatbot guides you step by step." },
  ]
  return (
    <section id="love" className="relative">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <SectionHeader center title="Automation without the learning curve." subtitle="Unlike traditional tools, Threadway isn’t built for businesses or developers. It’s built for people." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {points.map((p, i) => (
            <Card key={i} className="border-muted/60">
              <CardHeader>
                <CardTitle className="text-base">{p.title}</CardTitle>
                <CardDescription>{p.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// removed Pricing section per new direction

// removed Security & Privacy per new direction

// removed Testimonials per new direction

// removed Dashboard placeholder per new direction

// removed FAQ per new direction

function WaitlistSection() {
  return (
    <section id="waitlist" className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-72 w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.18),transparent_60%)] blur-2xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-2">
        <Card className="overflow-hidden border-border bg-card">
          <CardContent className="grid gap-4 p-6 md:grid-cols-5 md:items-center md:gap-6">
            <div className="md:col-span-2">
              <h3 className="text-xl font-semibold">Replace your notes chat with something smarter.</h3>
              <p className="text-sm text-muted-foreground">Threadway is coming soon. Join the waitlist to be the first to try it. No spam.</p>
            </div>
            <div className="md:col-span-3">
              <WaitlistForm />
            </div>
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
            <NextLink href="#why-threadway" className="hover:text-foreground">
              Why Threadway
            </NextLink>
            <NextLink href="#how-it-works" className="hover:text-foreground">
              How it works
            </NextLink>
            <NextLink href="#use-cases" className="hover:text-foreground">
              Use cases
            </NextLink>
            <NextLink href="#love" className="hover:text-foreground">
              Why people love it
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
      <WhyThreadway />
      <HowItWorks />
      <EverydayUseCases />
      <WhyPeopleLoveIt />
      <WaitlistSection />
      <Footer />
    </main>
  )
}
