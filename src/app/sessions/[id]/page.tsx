"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import PlayerRow from "@/components/PlayerRow";

interface Player {
  id: string;
  name: string;
  buyInCents: number;
  cashOutCents: number | null;
  hasCashedOut: boolean;
}

export default function LiveSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const sessionId = unwrappedParams.id;

  // Mocking standard game initialization state
  const [players, setPlayers] = useState<Player[]>([
    { id: "1", name: "Alex Chen", buyInCents: 5000, cashOutCents: null, hasCashedOut: false },
    { id: "2", name: "Sarah Jenkins", buyInCents: 10000, cashOutCents: null, hasCashedOut: false },
    { id: "3", name: "Marcus Vance", buyInCents: 5000, cashOutCents: null, hasCashedOut: false },
  ]);

  // Modal State Variables
  const [activeModal, setActiveModal] = useState<"add" | "topup" | "cashout" | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  
  // Dynamic Form Variables
  const [playerName, setPlayerName] = useState("");
  const [inputAmount, setInputAmount] = useState("");

  // Session clock simulation
  const [secondsElapsed, setSecondsElapsed] = useState(3240);
  useEffect(() => {
    const timer = setInterval(() => setSecondsElapsed(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    return `${hrs}h ${mins.toString().padStart(2, "0")}m`;
  };

  // Derived Summary Metric Blocks
  const totalPrizePool = players.reduce((sum, p) => sum + p.buyInCents, 0);
  const averageBuyIn = players.length > 0 ? totalPrizePool / players.length : 0;

  // Handlers
  const handleQuickRebuy = (id: string) => {
    setPlayers(prev =>
      prev.map(p => (p.id === id ? { ...p, buyInCents: p.buyInCents + 5000 } : p))
    );
  };

  const handleAddPlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName || !inputAmount) return;
    const amountInCents = Math.round(parseFloat(inputAmount) * 100);
    
    setPlayers(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: playerName,
        buyInCents: amountInCents,
        cashOutCents: null,
        hasCashedOut: false,
      },
    ]);
    
    setPlayerName("");
    setInputAmount("");
    setActiveModal(null);
  };

  const handleCustomTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer || !inputAmount) return;
    const topUpCents = Math.round(parseFloat(inputAmount) * 100);

    setPlayers(prev =>
      prev.map(p => p.id === selectedPlayer.id ? { ...p, buyInCents: p.buyInCents + topUpCents } : p)
    );
    
    setInputAmount("");
    setSelectedPlayer(null);
    setActiveModal(null);
  };

  const handleCashOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer || !inputAmount) return;
    const finalStackCents = Math.round(parseFloat(inputAmount) * 100);

    setPlayers(prev =>
      prev.map(p => p.id === selectedPlayer.id ? { ...p, cashOutCents: finalStackCents, hasCashedOut: true } : p)
    );
    
    setInputAmount("");
    setSelectedPlayer(null);
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 sm:p-10 text-zinc-900 dark:text-zinc-50">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation Escape Hatch */}
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group w-fit"
        >
          <span className="transform group-hover:-translate-x-0.5 transition-transform font-mono">←</span> 
          Leave Table (Return to Dashboard)
        </Link>

        {/* Top Minimalist Navigation Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Friday Night NLH</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Session ID: {sessionId}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setInputAmount(""); setActiveModal("add"); }}
              className="rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
            >
              Add Player
            </button>
            <button className="rounded-md bg-rose-600 hover:bg-rose-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all">
              End Session
            </button>
          </div>
        </div>

        {/* Dashboard Stat Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Total Total Pot</p>
            <p className="text-3xl font-bold tracking-tight mt-1 tabular-nums">{(totalPrizePool / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Avg Buy-in per Player</p>
            <p className="text-3xl font-bold tracking-tight mt-1 tabular-nums">{(averageBuyIn / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Session Clock</p>
            <p className="text-3xl font-bold tracking-tight mt-1 tabular-nums text-indigo-600 dark:text-indigo-400">{formatDuration(secondsElapsed)}</p>
          </div>
        </div>

        {/* Primary Operational Ledger */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/70 dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="py-3 pl-4">Player</th>
                  <th className="py-3">Total Invested</th>
                  <th className="py-3">Cash Out Stack</th>
                  <th className="py-3">Net Result</th>
                  <th className="py-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map(player => (
                  <PlayerRow
                    key={player.id}
                    player={player}
                    onQuickRebuy={handleQuickRebuy}
                    onOpenCustomTopUp={(p) => { setSelectedPlayer(p); setInputAmount(""); setActiveModal("topup"); }}
                    onOpenCashOut={(p) => { setSelectedPlayer(p); setInputAmount(p.cashOutCents ? (p.cashOutCents / 100).toString() : ""); setActiveModal("cashout"); }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Unified Minimal Overlay Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl animate-in fade-in-50 zoom-in-95 duration-150">
            
            {activeModal === "add" && (
              <form onSubmit={handleAddPlayerSubmit} className="space-y-4">
                <h3 className="text-lg font-semibold">Seat New Player</h3>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Player Name</label>
                  <input type="text" required value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="e.g. John Doe" className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Buy-In Amount ($)</label>
                  <input type="number" step="0.01" min="0" required value={inputAmount} onChange={e => setInputAmount(e.target.value)} placeholder="50.00" className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400" />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setActiveModal(null)} className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400">Cancel</button>
                  <button type="submit" className="rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3.5 py-1.5 text-sm font-semibold shadow">Confirm Seat</button>
                </div>
              </form>
            )}

            {activeModal === "topup" && selectedPlayer && (
              <form onSubmit={handleCustomTopUpSubmit} className="space-y-4">
                <h3 className="text-lg font-semibold">Top-up: {selectedPlayer.name}</h3>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Top-up Chips Value ($)</label>
                  <input type="number" step="0.01" min="0" required autoFocus value={inputAmount} onChange={e => setInputAmount(e.target.value)} placeholder="0.00" className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400" />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setActiveModal(null)} className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400">Cancel</button>
                  <button type="submit" className="rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3.5 py-1.5 text-sm font-semibold shadow">Add Chips</button>
                </div>
              </form>
            )}

            {activeModal === "cashout" && selectedPlayer && (
              <form onSubmit={handleCashOutSubmit} className="space-y-4">
                <h3 className="text-lg font-semibold">Cash Out: {selectedPlayer.name}</h3>
                <p className="text-xs text-zinc-400">Enter total final chip count back to currency conversion values.</p>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Final Ending Stack ($)</label>
                  <input type="number" step="0.01" min="0" required autoFocus value={inputAmount} onChange={e => setInputAmount(e.target.value)} placeholder="0.00" className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400" />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => { setActiveModal(null); setSelectedPlayer(null); }} className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400">Cancel</button>
                  <button type="submit" className="rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3.5 py-1.5 text-sm font-semibold shadow">Finalize Balance</button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
}