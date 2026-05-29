"use client";

import React from "react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans antialiased selection:bg-zinc-200 dark:selection:bg-zinc-800">
      
      {/* Premium, borderless top layout navigation header */}
      <header className="mx-auto max-w-6xl px-6 sm:px-10 h-20 flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-900/50">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
            <span className="text-[10px] font-black text-white dark:text-zinc-900">P</span>
          </div>
          <span className="font-bold tracking-tight text-sm">PokerLedger</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="/app/auth/login" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors">
            Sign In
          </a>
          <a
            href="/dashboard"
            className="rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3.5 py-1.5 text-xs font-semibold shadow hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
          >
            Open Dashboard
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-6 sm:px-10 pt-20 sm:pt-32 pb-24 space-y-32">
        
        {/* Hero Copy Block */}
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-900 px-3 py-1 border border-zinc-200/60 dark:border-zinc-800/60">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wide text-zinc-600 dark:text-zinc-400 uppercase">Now in Engine v2.0</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.1] text-zinc-900 dark:text-zinc-100">
            The banking layer for your home poker games.
          </h1>
          <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl font-normal leading-relaxed">
            Run clean live tracking boards, manage buy-ins, calculate instant top-ups, and run flawless greedy settlement transfers without messy spreadsheets.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
            <a
              href="/dashboard"
              className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 text-sm font-semibold shadow-md text-center hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
            >
              Get Started Instantly
            </a>
            <a
              href="#features"
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-6 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 text-center hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm transition-all"
            >
              See Architecture
            </a>
          </div>
        </div>

        {/* Feature Split Architecture */}
        <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-zinc-200/60 dark:border-zinc-900">
          
          <div className="space-y-3">
            <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              ⚡
            </div>
            <h3 className="text-base font-semibold tracking-tight">Zero-Friction Live Ledger</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Add seats, run instant custom chip top-ups, and calculate live player margins in real time. Built completely using integer math to ensure absolute calculation precision down to the cent.
            </p>
          </div>

          <div className="space-y-3">
            <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              🤝
            </div>
            <h3 className="text-base font-semibold tracking-tight">Greedy Settlement Engine</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Our background execution algorithms group net results into balance boxes. By pairing the largest debtors to creditors sequentially, we generate the minimum path of wire transfers.
            </p>
          </div>

          <div className="space-y-3">
            <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              📊
            </div>
            <h3 className="text-base font-semibold tracking-tight">Personal Bankroll Analytics</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Archive every home game session into permanent hot storage. View overall account cashflow velocity, historic win rates, game sizes, and track exactly who owes you money.
            </p>
          </div>

        </section>

        {/* Dynamic Trust/Tech Stack Footer Segment */}
        <div className="pt-8 border-t border-zinc-200/40 dark:border-zinc-900/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-zinc-400">
          <p>© 2026 PokerLedger. Open-source under MIT license.</p>
          <div className="flex gap-4 font-mono text-[10px] uppercase tracking-wider text-zinc-400/80">
            <span>Next.js 14 App Router</span>
            <span>•</span>
            <span>Prisma v7 ORM</span>
            <span>•</span>
            <span>Tailwind CSS</span>
          </div>
        </div>

      </main>
    </div>
  );
}