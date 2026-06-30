"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Player {
  id: string;
  name: string;
}

interface PlayerSession {
  id: string;
  playerId: string;
  sessionId: string;
  totalBuyIn: number; // Represents total buy-in chips
  currentChips: number; // Represents current cash-out chips
  player: Player;
}

interface Session {
  id: string;
  roomId: string | null;
  status: string; // "ACTIVE" | "COMPLETED"
  playerSessions: PlayerSession[];
}

interface ActiveSessionClientProps {
  initialSession: Session;
  tableStats: {
    totalPlayers: number;
    totalBuyIns: number;
    totalCurrentChips: number;
    isBalanced: boolean;
  };
}

export default function ActiveSessionClient({ initialSession, tableStats }: ActiveSessionClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [playerSessions, setPlayerSessions] = useState<PlayerSession[]>(initialSession.playerSessions);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [cashOutValues, setCashOutValues] = useState<Record<string, number>>({});

  // 🚀 Fast-Add Buy-In Chips Trigger
  const handleAddBuyIn = async (playerSessionId: string, amount: number) => {
    // 1. Optimistic UI update
    setPlayerSessions((prev) =>
      prev.map((ps) =>
        ps.id === playerSessionId
          ? { ...ps, totalBuyIn: ps.totalBuyIn + amount }
          : ps
      )
    );

    // 2. Refresh server context via Next.js router background transition sync
    startTransition(async () => {
      try {
        // TODO: Import and invoke your server action file mapping here:
        // await updateBuyInAction(playerSessionId, amount);
        router.refresh();
      } catch (err) {
        console.error("Failed to commit buy-in transaction:", err);
      }
    });
  };

  // 📝 Update Final Hand Chip Counts
  const handleSaveCashOut = async (playerSessionId: string) => {
    const finalAmount = cashOutValues[playerSessionId] || 0;

    setPlayerSessions((prev) =>
      prev.map((ps) =>
        ps.id === playerSessionId ? { ...ps, currentChips: finalAmount } : ps
      )
    );

    setEditingPlayerId(null);

    startTransition(async () => {
      try {
        // TODO: Import and invoke your server action file mapping here:
        // await updateCashOutAction(playerSessionId, finalAmount);
        router.refresh();
      } catch (err) {
        console.error("Failed to update settlement metrics:", err);
      }
    });
  };

  return (
    <div className="space-y-6">
      
      {/* ⚠️ Ledger Balance Security Guard Notification banner */}
      {!tableStats.isBalanced && tableStats.totalCurrentChips > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 flex gap-3 text-amber-200 text-sm">
          <span className="text-base">⚠️</span>
          <div>
            <p className="font-semibold text-amber-300">Table Balance Variance Detected</p>
            <p className="text-amber-400/80 text-xs mt-0.5 font-mono">
              The total chips on table ({tableStats.totalCurrentChips}) does not equal the total buy-in chips ({tableStats.totalBuyIns}). Variance: {tableStats.totalBuyIns - tableStats.totalCurrentChips} chips.
            </p>
          </div>
        </div>
      )}

      {/* Roster Container Card Grid */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
          <h2 className="font-bold text-zinc-100">Live Seat Standings</h2>
          <span className="text-xs font-mono px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full">
            {tableStats.totalPlayers} Players Seated
          </span>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {playerSessions.map((ps) => {
            const isEditing = editingPlayerId === ps.id;
            const balanceNet = ps.currentChips - ps.totalBuyIn;

            return (
              <div key={ps.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-zinc-900/30">
                
                {/* Profile Information Block */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-100 text-base">{ps.player.name}</span>
                    {ps.currentChips > 0 && (
                      <span className={`text-xs font-mono px-1.5 py-0.2 rounded font-bold ${balanceNet >= 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                        {balanceNet >= 0 ? `+${balanceNet} chips` : `${balanceNet} chips`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                    <div>Total Buy-In: <span className="text-zinc-200 text-sm font-semibold">{ps.totalBuyIn} chips</span></div>
                    <div>Chips: <span className="text-zinc-200 text-sm font-semibold">{ps.currentChips}</span></div>
                  </div>
                </div>

                {/* Tactical Live Operational Controllers Column */}
                <div className="flex flex-wrap items-center gap-3">
                  
                  {/* Quick-Add Buy In Fast Matrix chips buttons */}
                  <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                    <button
                      onClick={() => handleAddBuyIn(ps.id, 20)}
                      disabled={isPending}
                      className="px-2.5 py-1 text-xs font-mono font-bold text-zinc-400 hover:text-zinc-100 transition rounded hover:bg-zinc-800"
                    >
                      +20
                    </button>
                    <button
                      onClick={() => handleAddBuyIn(ps.id, 50)}
                      disabled={isPending}
                      className="px-2.5 py-1 text-xs font-mono font-bold text-zinc-400 hover:text-zinc-100 transition rounded hover:bg-zinc-800"
                    >
                      +50
                    </button>
                    <button
                      onClick={() => handleAddBuyIn(ps.id, 100)}
                      disabled={isPending}
                      className="px-2.5 py-1 text-xs font-mono font-bold text-zinc-400 hover:text-zinc-100 transition rounded hover:bg-zinc-800"
                    >
                      +100
                    </button>
                  </div>

                  {/* Cashout / Final stack counter modification segment */}
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                      <input
                        type="number"
                        placeholder="Final Chips"
                        className="w-24 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-sm font-mono focus:outline-none focus:border-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={cashOutValues[ps.id] ?? ps.currentChips}
                        onChange={(e) => setCashOutValues({ ...cashOutValues, [ps.id]: parseInt(e.target.value) || 0 })}
                      />
                      <button
                        onClick={() => handleSaveCashOut(ps.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 p-1.5 rounded-lg text-xs font-bold transition"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingPlayerId(null)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 p-1.5 rounded-lg text-xs transition"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingPlayerId(ps.id);
                        setCashOutValues({ ...cashOutValues, [ps.id]: ps.currentChips });
                      }}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-700/60 transition"
                    >
                      Count Chips
                    </button>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session Controls Action Strip */}
      <div className="flex items-center justify-between gap-4 border-t border-zinc-800/80 pt-4">
        <p className="text-xs text-zinc-500 font-mono italic">
          * Buy-in increments update local session matrix instances.
        </p>
        <button 
          disabled={!tableStats.isBalanced || tableStats.totalCurrentChips === 0}
          className={`px-5 py-2 rounded-xl text-sm font-bold transition border tracking-tight ${
            tableStats.isBalanced && tableStats.totalCurrentChips > 0
              ? 'bg-emerald-500 text-zinc-950 border-emerald-400 hover:bg-emerald-400'
              : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'
          }`}
        >
          Settle Ledger Matrix
        </button>
      </div>

    </div>
  );
}