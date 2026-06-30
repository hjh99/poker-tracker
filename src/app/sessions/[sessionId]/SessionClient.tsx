"use client"; // 🚀 Marks this module for safe execution inside the user's browser runtime

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { 
  processRebuyAction, 
  processCashOutAction, 
  endSessionAction, 
  type SessionDetailsSnapshot 
} from "./session.service";

interface SessionClientProps {
  initialData: SessionDetailsSnapshot;
  roomId: string;
  sessionId: string;
}

export default function SessionClientInteractive({ initialData, sessionId }: SessionClientProps) {
  const [isPending, startTransition] = useTransition();
  const [focusedPlayerId, setFocusedPlayerId] = useState<string>(initialData.players[0]?.id || "");
  const [cashOutCount, setCashOutCount] = useState<string>("");

  const pageRoutePath = `/sessions/${sessionId}`;

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "—";
    return amount.toLocaleString("en-US", {
      style: "currency", currency: "USD", signDisplay: amount < 0 ? "always" : "auto",
    });
  };

  const handleRebuyClick = () => {
    if (!focusedPlayerId) return;
    startTransition(async () => {
      try {
        await processRebuyAction(focusedPlayerId, initialData.startingChips, pageRoutePath);
      } catch (err) {
        alert("Could not process rebuy transaction.");
      }
    });
  };

  const handleCashOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawChips = parseInt(cashOutCount, 10);
    if (!focusedPlayerId || isNaN(rawChips) || rawChips < 0) return;

    startTransition(async () => {
      try {
        await processCashOutAction(focusedPlayerId, rawChips, pageRoutePath);
        setCashOutCount("");
      } catch (err) {
        alert("Could not process cash-out transaction.");
      }
    });
  };

  const handleArchiveClick = () => {
    if (!confirm("Finalize and archive this session? Profiles will cache these metrics permanently.")) return;
    startTransition(async () => {
      try {
        await endSessionAction(sessionId, pageRoutePath);
      } catch (err) {
        alert("Failed to archive session.");
      }
    });
  };

  const liveTotalBuyInChips = initialData.players.reduce((sum, p) => sum + p.buyInChips, 0);
  const liveTotalCashedOutChips = initialData.players.reduce((sum, p) => sum + (p.cashOutChips || 0), 0);
  const chipsImbalance = liveTotalBuyInChips - liveTotalCashedOutChips;

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-8">
      {/* Dynamic Link back to the parent Room Lobby fetched out of the database row */}
      <Link href={`/rooms/${initialData.roomId}`} className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">
        ← Back to Room Lobby
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
            initialData.status === "ACTIVE" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          }`}>
            {initialData.status} SESSION
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-2">
            Blinds: {initialData.smallBlind} / {initialData.bigBlind} Chips
          </h1>
        </div>

        <div className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl px-5 py-3 text-right">
          <p className="text-xs font-medium opacity-70">Total Pot Value</p>
          <p className="text-xl font-bold font-mono mt-0.5">{formatCurrency(initialData.totalPotDollars)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-xs text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                  <th className="p-4">Seated Player</th>
                  <th className="p-4 text-center">Chips In</th>
                  <th className="p-4 text-center">Out Chips</th>
                  <th className="p-4 text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-zinc-100 dark:divide-zinc-800">
                {initialData.players.map((player) => (
                  <tr key={player.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-800/10">
                    <td className="p-4 font-semibold flex flex-col">
                      <span>{player.name}</span>
                      <span className="text-[10px] font-normal text-zinc-400">Invested: {formatCurrency(player.buyInAmountDollars)}</span>
                    </td>
                    <td className="p-4 text-center font-mono text-zinc-600 dark:text-zinc-400">{player.buyInChips}</td>
                    <td className="p-4 text-center font-mono text-zinc-500">
                      {player.cashOutChips !== null ? player.cashOutChips : <span className="text-amber-500 text-xs">Playing...</span>}
                    </td>
                    <td className={`p-4 text-right font-mono font-bold ${
                      player.netProfitDollars === null ? "text-zinc-400" : player.netProfitDollars >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {formatCurrency(player.netProfitDollars)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {initialData.status === "ACTIVE" && (
            <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 dark:border-zinc-800/50 dark:bg-zinc-900/30 flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-medium">Table Balance Status:</span>
              <span className={`font-mono font-bold ${chipsImbalance === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                {chipsImbalance === 0 ? "✓ Chips perfectly balanced" : `⚠ ${chipsImbalance} chips currently unlogged`}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {initialData.status === "ACTIVE" ? (
            <>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-5 shadow-sm">
                <div>
                  <h2 className="text-base font-bold tracking-tight">Action Desk</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Issue add-ons or settle physical counts.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Target Seat</label>
                  <select
                    value={focusedPlayerId} onChange={(e) => setFocusedPlayerId(e.target.value)} disabled={isPending}
                    className="w-full text-sm bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-md p-2 focus:outline-none dark:bg-zinc-900"
                  >
                    {initialData.players.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} {p.hasCashedOut ? "(Setted)" : ""}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button" onClick={handleRebuyClick} disabled={isPending || initialData.players.find(p => p.id === focusedPlayerId)?.hasCashedOut}
                  className="w-full py-2 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 text-zinc-900 font-bold text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 transition-colors"
                >
                  + Process Rebuy (+{initialData.startingChips} Chips)
                </button>

                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
                  <form onSubmit={handleCashOutSubmit} className="space-y-3">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Cash-Out Stack Count</label>
                    <div className="flex gap-2">
                      <input
                        type="number" required placeholder="Chips remaining..." value={cashOutCount}
                        disabled={isPending || initialData.players.find(p => p.id === focusedPlayerId)?.hasCashedOut}
                        onChange={(e) => setCashOutCount(e.target.value)}
                        className="flex-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 text-sm focus:outline-none"
                      />
                      <button
                        type="submit" disabled={isPending || initialData.players.find(p => p.id === focusedPlayerId)?.hasCashedOut}
                        className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md px-4 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                      >
                        Settle Roster
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="bg-rose-50/40 border border-rose-200/60 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-rose-800 dark:text-rose-400">Danger Zone</h3>
                <button
                  onClick={handleArchiveClick} disabled={isPending}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm"
                >
                  End & Close Cash Session
                </button>
              </div>
            </>
          ) : (
            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center">
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Locked Archive</p>
              <p className="text-xs text-zinc-400 mt-1">This transaction ledger has been locked and archived.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}