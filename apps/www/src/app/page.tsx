import NextLink from "next/link"
import PhoneMockup from "@/components/landing/phone-mockup"
import WaitlistForm from "../components/landing/waitlist-form"
import { ArrowRight, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"


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
            <Button asChild size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-[0_8px_20px_-8px_rgba(16,185,129,0.5)] transition-transform hover:scale-[1.02]">
              <NextLink href="#waitlist">
                Join Waitlist
                <ArrowRight className="ml-1 h-3 w-3" />
              </NextLink>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}

function AmbientHeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),transparent_60%)] blur-3xl" />
      <div className="absolute right-0 top-20 h-[400px] w-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.12),transparent_60%)] blur-2xl" />
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
              <Button asChild size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-[0_12px_28px_-12px_rgba(16,185,129,0.65)] transition-transform hover:scale-[1.01]">
                <NextLink href="#waitlist">
                  Join the Waitlist
                  <ArrowRight className="ml-2 h-4 w-4" />
                </NextLink>
              </Button>
            </div>
          </div>
          <div className="relative">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  )
}

function WhyThreadway() {
  return (
    <section id="why-threadway" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Why Threadway?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Most people already use WhatsApp to message themselves. We make that habit 10x more powerful.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>No New App</CardTitle>
              <CardDescription>
                Works inside WhatsApp. No downloads, no learning curve, no switching between apps.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Instant Organization</CardTitle>
              <CardDescription>
                Your messages are automatically categorized, tagged, and stored where they belong.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Smart Automation</CardTitle>
              <CardDescription>
                Set up workflows once, then just message naturally. Threadway handles the rest.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      step: "1",
      title: "Message Threadway",
      description: "Send expenses, reminders, links, or any note to your Threadway number on WhatsApp."
    },
    {
      step: "2", 
      title: "AI Understands",
      description: "Our AI categorizes your message and determines the right action based on your workflows."
    },
    {
      step: "3",
      title: "Auto-Organized",
      description: "Your data is automatically saved to the right place — spreadsheets, calendars, note apps."
    }
  ]

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-muted-foreground">
            Three simple steps to upgrade your messaging habit.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.step} className="relative">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-semibold text-white">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="absolute left-5 top-10 hidden h-16 w-px bg-gradient-to-b from-emerald-200 to-transparent md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function EverydayUseCases() {
  const useCases = [
    {
      title: "Expense Tracking",
      description: "\"Bought coffee $4.50\" → Automatically logged to your spending spreadsheet",
      icon: "💰"
    },
    {
      title: "Reading List",
      description: "\"Save this article\" → Link saved to your Notion reading list with summary",
      icon: "📚"
    },
    {
      title: "Workout Log",
      description: "\"Did 20 pushups\" → Logged to your fitness tracker with date and reps",
      icon: "💪"
    },
    {
      title: "Reminders",
      description: "\"Remind me to call mom Friday 6pm\" → Calendar event created with notification",
      icon: "⏰"
    },
    {
      title: "Meeting Notes",
      description: "\"Meeting with John about project X\" → Saved to your work notes with context",
      icon: "📝"
    },
    {
      title: "Shopping List",
      description: "\"Need milk and eggs\" → Added to your shared family shopping list",
      icon: "🛒"
    }
  ]

  return (
    <section id="use-cases" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everyday use cases
          </h2>
          <p className="mt-4 text-muted-foreground">
            Turn your random thoughts into organized, actionable data.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {useCases.map((useCase) => (
            <Card key={useCase.title} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{useCase.icon}</span>
                  <CardTitle className="text-lg">{useCase.title}</CardTitle>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {useCase.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhyPeopleLoveIt() {
  const benefits = [
    "No context switching between apps",
    "Works with your existing tools",
    "Natural language — no commands to remember",
    "Learns your preferences over time",
    "Secure and private",
    "Works on any device with WhatsApp"
  ]

  return (
    <section id="love" className="py-16 md:py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Why people love Threadway
            </h2>
            <p className="mt-4 text-muted-foreground">
              Finally, a productivity tool that works the way you already think and communicate.
            </p>
            <div className="mt-8 grid gap-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600" />
                  <div>
                    <div className="font-medium">Sarah Chen</div>
                    <div className="text-sm text-muted-foreground">Product Manager</div>
                  </div>
                </div>
                <blockquote className="text-sm leading-relaxed">
                  &quot;I was already messaging myself expenses and reminders. Threadway just made it actually useful. Now everything gets organized automatically.&quot;
                </blockquote>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

function WaitlistSection() {
  return (
    <section id="waitlist" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to upgrade your messaging habit?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join the waitlist to be among the first to try Threadway when we launch.
          </p>
          <div className="mt-8">
            <WaitlistForm className="mx-auto max-w-md" />
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="grid h-6 w-6 place-items-center rounded bg-gradient-to-br from-emerald-600 to-teal-600 text-xs font-bold text-white">
              T
            </div>
            <span className="font-medium">Threadway</span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © 2024 Threadway. All rights reserved.
          </p>
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