"use client";

import React, { useState } from "react";

interface PokerSession {
  id: string;
  date: string;
  name: string;
  playerCount: number;
  totalPotCents: number;
  netResultCents: number; // Your personal take-home profit/loss
  status: "ACTIVE" | "COMPLETED";
}

export default function DashboardPage() {
  // Mock data representing historical performance
  const [sessions] = useState<PokerSession[]>([
    { id: "sess_003", date: "May 29, 2026", name: "Friday Night NLH", playerCount: 8, totalPotCents: 64000, netResultCents: 12500, status: "ACTIVE" },
    { id: "sess_002", date: "May 22, 2026", name: "Deepstack Deep Dive", playerCount: 6, totalPotCents: 45000, netResultCents: -5000, status: "COMPLETED" },
    { id: "sess_001", date: "May 15, 2026", name: "Home Game Warmup", playerCount: 7, totalPotCents: 35000, netResultCents: 7500, status: "COMPLETED" },
  ]);

  // Derived Performance Metrics
  const completedSessions = sessions.filter(s => s.status === "COMPLETED");
  const totalEarningsCents = sessions.reduce((sum, s) => sum + s.netResultCents, 0);
  const totalVolumeCents = sessions.reduce((sum, s) => sum + s.totalPotCents, 0);
  const winRatePercentage = completedSessions.length > 0 
    ? Math.round((completedSessions.filter(s => s.netResultCents > 0).length / completedSessions.length) * 100) 
    : 100;

  const formatCurrency = (cents: number) => {
    const isNegative = cents < 0;
    const absoluteValue = Math.abs(cents) / 100;
    const formatted = absoluteValue.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
    return isNegative ? `-${formatted}` : formatted;
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 sm:p-10 text-zinc-900 dark:text-zinc-50">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Minimalist Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Poker Ledger</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1"> Track bankrolls, live sessions, and peer-to-peer settlements.</p>
          </div>
          <a
            href="/sessions/new"
            className="rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-semibold shadow hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
          >
            Start New Session
          </a>
        </div>

        {/* Executive Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Net Profit / Loss</p>
            <p className={`text-3xl font-bold tracking-tight mt-1 tabular-nums ${totalEarningsCents >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {totalEarningsCents > 0 ? "+" : ""}
              {formatCurrency(totalEarningsCents)}
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Total Pot Volume Handled</p>
            <p className="text-3xl font-bold tracking-tight mt-1 tabular-nums">{formatCurrency(totalVolumeCents)}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Session Win Rate</p>
            <p className="text-3xl font-bold tracking-tight mt-1 text-indigo-600 dark:text-indigo-400 tabular-nums">{winRatePercentage}%</p>
          </div>
        </div>

        {/* Sessions Activity Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Recent Sessions</h2>
          
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/70 dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    <th className="py-3 pl-4">Date</th>
                    <th className="py-3">Session Name</th>
                    <th className="py-3">Players</th>
                    <th className="py-3">Total Stakes</th>
                    <th className="py-3">Your Net</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id} className="border-b border-zinc-100 dark:border-zinc-800 text-sm hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="py-4 pl-4 text-zinc-500 dark:text-zinc-400 font-medium tabular-nums">{session.date}</td>
                      <td className="py-4 font-semibold text-zinc-900 dark:text-zinc-100">{session.name}</td>
                      <td className="py-4 text-zinc-600 dark:text-zinc-400 tabular-nums">{session.playerCount} seated</td>
                      <td className="py-4 text-zinc-600 dark:text-zinc-400 tabular-nums">{formatCurrency(session.totalPotCents)}</td>
                      <td className="py-4 tabular-nums font-medium">
                        <span className={session.netResultCents >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                          {session.netResultCents > 0 ? "+" : ""}
                          {formatCurrency(session.netResultCents)}
                        </span>
                      </td>
                      <td className="py-4">
                        {session.status === "ACTIVE" ? (
                          <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/50 animate-pulse">
                            Live Now
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                            Closed
                          </span>
                        )}
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <a
                          href={`/sessions/${session.id}`}
                          className="inline-flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                        >
                          {session.status === "ACTIVE" ? "Open Board" : "View Details"}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}