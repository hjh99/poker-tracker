"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { calculateSettlement, Transaction, PlayerBalance } from "@/lib/settlement";

interface Player {
  id: string;
  name: string;
  buyInChips: number;          // Raw physical chips
  cashOutChips: number | null; // Raw physical chips
  hasCashedOut: boolean;
}

function LiveSessionContent() {
  const searchParams = useSearchParams();

  // Core Data & UI View State Hooks
  const [players, setPlayers] = useState<Player[]>([]);
  const [activeModal, setActiveModal] = useState<"add" | "topup" | "cashout" | null>(null);
  const [settlementModalOpen, setSettlementModalOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Game Configuration Parameters (Defaulting to a standard home game setup: $50 buy-in for 500 chips)
  const [dollarBuyIn, setDollarBuyIn] = useState<number>(50);
  const [startingChips, setStartingChips] = useState<number>(500);
  const [smallBlind, setSmallBlind] = useState<number>(5);
  const [bigBlind, setBigBlind] = useState<number>(10);
  
  // Target States for Operational Focus Modals
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [inputChips, setInputChips] = useState(""); 
  
  // Real-time Dashboard Runtime Indicators
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [finalTransactions, setFinalTransactions] = useState<Transaction[]>([]);

  // Parse parameters out of the incoming URL query payload on mount
  useEffect(() => {
    const queryNames = searchParams.get("names");
    const queryBuyIn = searchParams.get("buyIn"); // Expected as raw currency if provided

    if (queryBuyIn) {
      const parsedBuyIn = parseFloat(queryBuyIn);
      if (!isNaN(parsedBuyIn)) {
        setDollarBuyIn(parsedBuyIn);
      }
    }

    if (queryNames) {
      const initialRoster = queryNames.split(",").map((nameString) => ({
        id: crypto.randomUUID(),
        name: decodeURIComponent(nameString.trim()),
        buyInChips: startingChips, // Standard baseline initialization stack
        cashOutChips: null,
        hasCashedOut: false,
      }));
      setPlayers(initialRoster);
    }
  }, [searchParams, startingChips]);

  // Session clock simulation hook
  useEffect(() => {
    const timer = setInterval(() => setSecondsElapsed(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    return `${hrs}h ${mins.toString().padStart(2, "0")}m`;
  };

  // Derive cash value of an arbitrary chip pool based on current room buy-in parameters
  const chipsToDollarsStr = (chips: number) => {
    if (startingChips <= 0) return "$0.00";
    const amount = (chips * dollarBuyIn) / startingChips;
    return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
  };

  // Live Metric Tracking Formulations
  const totalChipsInPlay = players.reduce((sum, p) => sum + p.buyInChips, 0);
  const averageChipsPerPlayer = players.length > 0 ? totalChipsInPlay / players.length : 0;

  // Immediate Quick Rebuy Vector Modification (Uses standard starting chip baseline)
  const handleQuickRebuy = (id: string) => {
    setPlayers(prev =>
      prev.map(p => (p.id === id ? { ...p, buyInChips: p.buyInChips + startingChips } : p))
    );
  };

  // Add Dynamic Mid-Game Player
  const handleAddPlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName || !inputChips) return;
    const chipsAmount = parseInt(inputChips, 10);
    
    setPlayers(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: playerName,
        buyInChips: chipsAmount,
        cashOutChips: null,
        hasCashedOut: false,
      },
    ]);
    
    setPlayerName("");
    setInputChips("");
    setActiveModal(null);
  };

  // Apply Precise Add-on / Top-Up Action Vector
  const handleCustomTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer || !inputChips) return;
    const topUpChips = parseInt(inputChips, 10);

    setPlayers(prev =>
      prev.map(p => p.id === selectedPlayer.id ? { ...p, buyInChips: p.buyInChips + topUpChips } : p)
    );
    
    setInputChips("");
    setSelectedPlayer(null);
    setActiveModal(null);
  };

  // Finalize Active Player Cash Out Stack
  const handleCashOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer || !inputChips) return;
    const finalStackChips = parseInt(inputChips, 10);

    setPlayers(prev =>
      prev.map(p => p.id === selectedPlayer.id ? { ...p, cashOutChips: finalStackChips, hasCashedOut: true } : p)
    );
    
    setInputChips("");
    setSelectedPlayer(null);
    setActiveModal(null);
  };

  // Trigger Settlement Engine & Chip Balance Validation Guards
  const handleEndSession = () => {
    const totalBuyInChips = players.reduce((sum, p) => sum + p.buyInChips, 0);
    const totalCashOutChips = players.reduce((sum, p) => sum + (p.cashOutChips ?? 0), 0);
    const discrepancyChips = totalCashOutChips - totalBuyInChips;

    if (discrepancyChips !== 0) {
      if (discrepancyChips > 0) {
        setValidationError(`The table does not balance! There are ${Math.abs(discrepancyChips).toLocaleString()} MORE physical chips on the table than total buy-ins.`);
      } else {
        setValidationError(`The table does not balance! There are ${Math.abs(discrepancyChips).toLocaleString()} physical chips MISSING from the pot.`);
      }
      setSettlementModalOpen(true);
      return;
    }

    setValidationError(null);

    // Convert internal variations to currency cents for exact precision settlement payouts
    const sessionBalances: PlayerBalance[] = players.map((p) => {
      const cashOut = p.cashOutChips ?? 0;
      const netChipsDelta = cashOut - p.buyInChips;
      
      const netResultDollars = (netChipsDelta * dollarBuyIn) / startingChips;
      const netResultCents = Math.round(netResultDollars * 100);
      return {
        name: p.name,
        netResultCents,
      };
    });

    const transactions = calculateSettlement(sessionBalances);
    setFinalTransactions(transactions);
    setSettlementModalOpen(true);
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

        {/* Top Navigation Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Active Room Session</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Live chip tracking environment with structural financial conversion ratios.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Stakes & Structure Configurations Controls Layout */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-lg shadow-sm">
              <div className="flex items-center gap-1.5 px-2 py-1">
                <span className="text-xs text-zinc-400 font-medium">Buy-In:</span>
                <span className="text-xs font-bold text-zinc-400">$</span>
                <input 
                  type="number" 
                  min="1"
                  value={dollarBuyIn} 
                  onChange={(e) => setDollarBuyIn(Math.max(1, parseFloat(e.target.value) || 1))} 
                  className="w-12 bg-transparent font-mono font-bold text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 border-l sm:border-l border-zinc-100 dark:border-zinc-800">
                <span className="text-xs text-zinc-400 font-medium">Chips:</span>
                <input 
                  type="number" 
                  min="1"
                  value={startingChips} 
                  onChange={(e) => setStartingChips(Math.max(1, parseInt(e.target.value, 10) || 1))} 
                  className="w-14 bg-transparent font-mono font-bold text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 border-t sm:border-t-0 sm:border-l border-zinc-100 dark:border-zinc-800 col-span-2 sm:col-span-1 justify-center">
                <span className="text-xs text-zinc-400 font-medium">Blinds:</span>
                <input 
                  type="number" 
                  min="1"
                  value={smallBlind} 
                  onChange={(e) => setSmallBlind(Math.max(1, parseInt(e.target.value, 10) || 1))} 
                  className="w-8 bg-transparent font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400 text-center focus:outline-none"
                />
                <span className="text-zinc-300 dark:text-zinc-700 text-xs font-bold">/</span>
                <input 
                  type="number" 
                  min="1"
                  value={bigBlind} 
                  onChange={(e) => setBigBlind(Math.max(1, parseInt(e.target.value, 10) || 1))} 
                  className="w-8 bg-transparent font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400 text-center focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 ml-auto lg:ml-0">
              <button
                onClick={() => { setInputChips(startingChips.toString()); setActiveModal("add"); }}
                className="rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
              >
                Add Player
              </button>
              <button 
                onClick={handleEndSession}
                className="rounded-md bg-rose-600 hover:bg-rose-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all"
              >
                End Session
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Stat Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Total Pot Value</p>
            <p className="text-3xl font-bold tracking-tight mt-1 tabular-nums">
              {totalChipsInPlay.toLocaleString()} <span className="text-xs font-normal text-zinc-400 font-sans ml-1">chips ({chipsToDollarsStr(totalChipsInPlay)})</span>
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Avg Stack per Player</p>
            <p className="text-3xl font-bold tracking-tight mt-1 tabular-nums">
              {Math.round(averageChipsPerPlayer).toLocaleString()} <span className="text-xs font-normal text-zinc-400 font-sans ml-1">chips ({chipsToDollarsStr(averageChipsPerPlayer)})</span>
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Structure / Session Clock</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400 tabular-nums">
                {formatDuration(secondsElapsed)}
              </p>
              <span className="text-xs font-medium text-zinc-400 font-mono">
                (Blinds: {smallBlind}/{bigBlind})
              </span>
            </div>
          </div>
        </div>
        
        {/* Primary Operational Ledger */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/70 dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="py-3 pl-4">Player</th>
                  <th className="py-3">Chips Invested</th>
                  <th className="py-3">Cash Out Stack</th>
                  <th className="py-3">Financial Net Result</th>
                  <th className="py-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map(player => {
                  const cashOut = player.cashOutChips ?? 0;
                  const netChips = cashOut - player.buyInChips;
                  const netDollars = startingChips > 0 ? (netChips * dollarBuyIn) / startingChips : 0;
                  
                  return (
                    <tr key={player.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors text-sm">
                      <td className="py-3.5 pl-4 font-semibold">{player.name}</td>
                      <td className="py-3.5 font-mono text-zinc-500">{player.buyInChips.toLocaleString()} chips</td>
                      <td className="py-3.5 font-mono">
                        {player.hasCashedOut ? `${player.cashOutChips?.toLocaleString()} chips` : <span className="text-zinc-400 italic text-xs">Still Playing</span>}
                      </td>
                      <td className={`py-3.5 font-mono font-bold ${netDollars >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {player.hasCashedOut ? (netDollars >= 0 ? "+" : "") + netDollars.toLocaleString("en-US", { style: "currency", currency: "USD" }) : "—"}
                      </td>
                      <td className="py-3.5 pr-4 text-right space-x-2">
                        <button onClick={() => handleQuickRebuy(player.id)} disabled={player.hasCashedOut} className="px-2.5 py-1 text-xs font-medium rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm disabled:opacity-40">
                          +{startingChips} Chips
                        </button>
                        <button onClick={() => { setSelectedPlayer(player); setInputChips(""); setActiveModal("topup"); }} disabled={player.hasCashedOut} className="px-2.5 py-1 text-xs font-medium rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm disabled:opacity-40">
                          Top-Up
                        </button>
                        <button onClick={() => { setSelectedPlayer(player); setInputChips(player.cashOutChips ? player.cashOutChips.toString() : ""); setActiveModal("cashout"); }} className="px-2.5 py-1 text-xs font-semibold rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm">
                          {player.hasCashedOut ? "Edit Stack" : "Cash Out"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Standalone Operational Flow Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl animate-in fade-in-50 zoom-in-95 duration-150">
            
            {activeModal === "add" && (
              <form onSubmit={handleAddPlayerSubmit} className="space-y-4">
                <h3 className="text-lg font-semibold">Seat New Player</h3>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Player Name</label>
                  <input type="text" required value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="e.g. Aron" className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Initial Buy-In (Physical Chips)</label>
                  <input type="number" required value={inputChips} onChange={e => setInputChips(e.target.value)} className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setActiveModal(null)} className="px-3 py-1.5 text-sm font-medium text-zinc-500">Cancel</button>
                  <button type="submit" className="rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3.5 py-1.5 text-sm font-semibold">Confirm Seat</button>
                </div>
              </form>
            )}

            {activeModal === "topup" && selectedPlayer && (
              <form onSubmit={handleCustomTopUpSubmit} className="space-y-4">
                <h3 className="text-lg font-semibold">Top-up: {selectedPlayer.name}</h3>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Add Physical Chips Amount</label>
                  <input type="number" required autoFocus value={inputChips} onChange={e => setInputChips(e.target.value)} placeholder={startingChips.toString()} className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setActiveModal(null)} className="px-3 py-1.5 text-sm font-medium text-zinc-500">Cancel</button>
                  <button type="submit" className="rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3.5 py-1.5 text-sm font-semibold">Add Chips</button>
                </div>
              </form>
            )}

            {activeModal === "cashout" && selectedPlayer && (
              <form onSubmit={handleCashOutSubmit} className="space-y-4">
                <h3 className="text-lg font-semibold">Cash Out: {selectedPlayer.name}</h3>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Final Physical Ending Chips Stack</label>
                  <input type="number" required autoFocus value={inputChips} onChange={e => setInputChips(e.target.value)} className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setActiveModal(null)} className="px-3 py-1.5 text-sm font-medium text-zinc-500">Cancel</button>
                  <button type="submit" className="rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3.5 py-1.5 text-sm font-semibold">Finalize Balance</button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Final Settlement Summary Sheet Overlay */}
      {settlementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl animate-in fade-in-50 zoom-in-95 duration-150 space-y-4">
            
            {validationError ? (
              <div>
                <h3 className="text-xl font-bold tracking-tight text-rose-600 dark:text-rose-400">Table Configuration Error</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 p-3 rounded-lg font-medium leading-relaxed">
                  {validationError}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold tracking-tight">Game Settlement Sheet</h3>
                <p className="text-xs text-zinc-400 mt-1">Calculated financial payout paths mapped directly to your custom structural configurations.</p>
              </div>
            )}

            {!validationError && (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden bg-zinc-50/30 dark:bg-zinc-950/20 max-h-64 overflow-y-auto">
                {finalTransactions.length === 0 ? (
                  <div className="p-4 text-center text-sm text-zinc-400 font-medium">
                    Everyone broke perfectly even! No transactions needed.
                  </div>
                ) : (
                  finalTransactions.map((tx, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-sm">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-rose-600 dark:text-rose-400">{tx.from}</span>
                        <span className="text-zinc-400 text-xs mx-2">pays</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{tx.to}</span>
                      </div>
                      <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        {(tx.amountCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setSettlementModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                {validationError ? "Recount Physical Chips" : "Go Back"}
              </button>
              
              {!validationError && (
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-semibold shadow hover:opacity-90 text-center transition-all"
                >
                  Archive & Return to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DynamicLiveSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-xs text-zinc-400 font-mono tracking-widest uppercase">
        Seeding Session Tables...
      </div>
    }>
      <LiveSessionContent />
    </Suspense>
  );
}