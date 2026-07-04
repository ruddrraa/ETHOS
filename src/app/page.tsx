"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BarChart3, Users, Calendar, Shield, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-primary/20">
      {/* Glow Effects (Light Mode Optimized) */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[800px] w-[1200px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08)_0%,transparent_60%)] blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-1/4 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(52,211,153,0.05)_0%,transparent_70%)] blur-3xl" />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-6 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-border/40 bg-white/70 px-5 py-3 shadow-soft backdrop-blur-md transition-all duration-300">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="ETHOS Logo" className="h-20 w-48 object-contain origin-left" />
          </div>
          
          <nav className="hidden items-center gap-2 md:flex">
            <Link href="#features" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">Features</Link>
            <Link href="#workflow" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">How it works</Link>
            <Link href="#dashboard" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">Dashboard</Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground sm:inline-flex">
              Log in
            </Link>
            <Link href="/login">
              <Button className="rounded-full px-6 shadow-sm shadow-primary/25 hover:shadow-md hover:shadow-primary/30 transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 sm:pt-40 lg:pt-48">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-4xl text-center">
              <div className="animate-fade-in [animation-delay:100ms] opacity-0 fill-mode-forwards">
                <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/80 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Enterprise HRMS for Modern Teams
                </p>
                <h1 className="text-[clamp(2.75rem,7vw,5.5rem)] font-bold leading-[1.05] tracking-[-0.03em] text-foreground">
                  <span className="block">Never lose track of</span>
                  <span className="relative mt-2 flex min-h-[1.1em] items-center justify-center overflow-hidden">
                    <span className="block text-primary">your employees</span>
                  </span>
                  <span className="mt-2 block text-muted-foreground/80">again.</span>
                </h1>
                <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Manage attendance, process payroll, approve leaves, and view AI-powered analytics through one cinematic workspace — built for the modern workforce.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link href="/login">
                    <Button size="lg" className="h-14 rounded-full px-8 text-base font-semibold shadow-soft-lg hover:shadow-lg shadow-primary/25 hover:scale-105 transition-all">
                      Open Workspace <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="h-14 rounded-full border-border/80 bg-white/50 px-8 text-base font-medium backdrop-blur-sm hover:bg-white sm:w-auto">
                    <Sparkles className="mr-2 h-5 w-5 text-primary" /> Try AI Demo
                  </Button>
                </div>
              </div>
            </div>

            {/* Dashboard Preview Frame */}
            <div className="relative mx-auto mt-20 max-w-5xl animate-fade-in [animation-delay:400ms] opacity-0 fill-mode-forwards">
              <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-b from-border/80 to-transparent opacity-80" />
              <div className="relative overflow-hidden rounded-[27px] border border-border/80 bg-card shadow-soft-lg">
                <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                  </div>
                  <span className="mx-auto font-mono text-[10px] font-semibold text-muted-foreground">ethos.app — dashboard</span>
                </div>
                
                {/* Mockup Dashboard Content inside */}
                <div className="p-6 bg-background">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Employees</p>
                      <p className="mt-2 text-3xl font-bold tracking-tight">142</p>
                      <p className="mt-1 flex items-center text-xs font-semibold text-emerald-600">
                        <TrendingUp className="mr-1 h-3 w-3" /> +4 this month
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Leaves</p>
                      <p className="mt-2 text-3xl font-bold tracking-tight">8</p>
                      <p className="mt-1 text-xs font-semibold text-amber-600">3 pending approval</p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Payroll Processed</p>
                      <p className="mt-2 text-3xl font-bold tracking-tight">$82.4K</p>
                      <p className="mt-1 flex items-center text-xs font-semibold text-emerald-600">
                        <CheckCircle className="mr-1 h-3 w-3" /> All clear
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm min-h-[160px] flex flex-col justify-center">
                       <div className="flex items-center gap-3 mb-4">
                         <div className="p-2 rounded-lg bg-primary/10 text-primary"><Calendar className="h-5 w-5" /></div>
                         <div>
                           <h4 className="font-semibold text-sm">Attendance sync</h4>
                           <p className="text-xs text-muted-foreground">Live tracking via IP & Geolocation</p>
                         </div>
                       </div>
                       <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                         <div className="h-full bg-primary w-[85%] rounded-full"></div>
                       </div>
                       <p className="text-right text-xs text-muted-foreground mt-2 font-medium">85% present today</p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm min-h-[160px] flex flex-col justify-center">
                       <div className="flex items-center gap-3 mb-4">
                         <div className="p-2 rounded-lg bg-primary/10 text-primary"><Sparkles className="h-5 w-5" /></div>
                         <div>
                           <h4 className="font-semibold text-sm">AI Copilot Action</h4>
                           <p className="text-xs text-muted-foreground">Suggested performance reviews</p>
                         </div>
                       </div>
                       <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-xs font-medium text-foreground">
                         &quot;Draft review for Alex based on Q3 commits and attendance.&quot;
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative py-24 sm:py-32 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                <span className="text-primary">/ 01</span><span className="mx-2 text-border">—</span>What you get
              </p>
              <h2 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl md:leading-[1.1]">
                Everything HR, <br/>beautifully designed.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Replace cluttered spreadsheets and ancient HR tools with a single, lightning-fast workspace that your team will actually love to use.
              </p>
            </div>
            
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Users, title: "Employee Directory", desc: "Manage detailed profiles, emergency contacts, and documents in beautiful floating cards." },
                { icon: Calendar, title: "Leave & Attendance", desc: "Track daily check-ins and approve leave requests with zero friction and visual analytics." },
                { icon: Zap, title: "Automated Payroll", desc: "Generate payslips and calculate salary structures instantly with built-in compliance checks." },
                { icon: BarChart3, title: "Rich Analytics", desc: "View Recharts-powered interactive dashboards for performance, attendance, and HR metrics." },
                { icon: Shield, title: "Role-Based Access", desc: "Super Admin, HR, Manager, and Employee roles with strictly enforced data guards." },
                { icon: Sparkles, title: "AI Integration", desc: "Ask questions about company policy or generate insights via the built-in AI Copilot." },
              ].map((feature, i) => (
                <div key={i} className="group relative overflow-hidden rounded-[24px] border border-border/60 bg-card p-8 shadow-sm transition duration-300 hover:shadow-soft-lg hover:-translate-y-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold tracking-tight">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-border/40 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2.5 mb-4 md:mb-0">
            <img src="/logo.png" alt="ETHOS Logo" className="h-24 w-56 object-contain origin-left grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
          </div>
          <p className="text-sm text-muted-foreground">© 2026 ETHOS HRMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// Temporary icon imports (replace or use existing)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TrendingUp(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CheckCircle(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
}
