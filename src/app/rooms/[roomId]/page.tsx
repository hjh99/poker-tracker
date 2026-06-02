"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";

interface SavedPlayer {
  id: string;
  name: string;
  gamesPlayed: number;
  netProfitCents: number;
}

interface HistoricalSession {
  id: string;
  date: string;
  playerCount: number;
  totalPotCents: number;
}

export default function RoomLobbyPage({ params }: { params: Promise<{ roomId: string }> }) {
  const router = useRouter();
  const { roomId } = use(params);

  // Mock Room Meta Data (Would come from Supabase using roomId)
  const roomName = "Sengkang Rounders";
  const roomPasscode = "8888";

  // Mock Permanent Club Roster
  const [roster, setRoster] = useState<SavedPlayer[]>([
    { id: "p1", name: "Alex Chen", gamesPlayed: 14, netProfitCents: 12500 },
    { id: "p2", name: "Sarah Jenkins", gamesPlayed: 12, netProfitCents: -4500 },
    { id: "p3", name: "Marcus Vance", gamesPlayed: 10, netProfitCents: 8500 },
    { id: "p4", name: "Nicholas Ho", gamesPlayed: 8, netProfitCents: -16000 },
    { id: "p5", name: "Aron Lim", gamesPlayed: 3, netProfitCents: -500 },
  ]);

  // Mock Historical Log of Ended Games
  const history: HistoricalSession[] = [
    { id: "sess_01", date: "May 29, 2026", playerCount: 5, totalPotCents: 35000 },
    { id: "sess_02", date: "May 22, 2026", playerCount: 4, totalPotCents: 20000 },
  ];

  // State for seeding a new session
  const [selectedRosterIds, setSelectedRosterIds] = useState<string[]>(["p1", "p2", "p3"]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [isSeedingGame, setIsSeedingGame] = useState(false);
  const [defaultBuyIn, setDefaultBuyIn] = useState("50.00");

  // Handlers
  const handleTogglePlayerSelection = (id: string) => {
    setSelectedRosterIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAddToRosterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    
    const newPlayer: SavedPlayer = {
      id: crypto.randomUUID(),
      name: newPlayerName.trim(),
      gamesPlayed: 0,
      netProfitCents: 0
    };

    setRoster(prev => [...prev, newPlayer]);
    setSelectedRosterIds(prev => [...prev, newPlayer.id]); // Auto-select for the game
    setNewPlayerName("");
  };

  const handleLaunchSession = () => {
    // 1. Gather selected players
    const activeSeatedPlayers = roster.filter(p => selectedRosterIds.includes(p.id));
    
    // 2. In production, fire API call to create a Session record with these players initialized
    console.log("Launching session with players:", activeSeatedPlayers, "Initial Buy-in:", defaultBuyIn);
    
    // 3. Redirect to the live session workspace screen we made earlier
    const mockGeneratedSessionId = "session_" + Math.random().toString(36).substring(2, 7);
    router.push(`/sessions/${mockGeneratedSessionId}`);
  };

  const formatCurrency = (cents: number) => {
    const dollars = cents / 100;
    return dollars.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      signDisplay: "always",
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 sm:p-10 text-zinc-900 dark:text-zinc-50">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Breadcrumb & Header Title Ribbon */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-wider mb-1">
              <span>Poker Rooms</span>
              <span>/</span>
              <span className="text-zinc-500 font-medium">{roomId}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{roomName}</h1>
          </div>
          
          <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 shadow-sm text-sm">
            <div>
              <p className="text-xs text-zinc-400 font-medium">Room PIN Passcode</p>
              <p className="font-mono font-bold text-zinc-700 dark:text-zinc-300 tracking-widest">{roomPasscode}</p>
            </div>
          </div>
        </div>

        {/* Dashboard Panels Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left / Middle: Roster Directory Management */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800/70 rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">Club Roster Directory</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Permanent member tracking & lifetime club balances.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      <th className="py-3 pl-5">Player Name</th>
                      <th className="py-3 text-center">Games</th>
                      <th className="py-3 pr-5 text-right">Lifetime Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-sm">
                    {roster.map(player => (
                      <tr key={player.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/40">
                        <td className="py-3.5 pl-5 font-medium">{player.name}</td>
                        <td className="py-3.5 text-center font-mono text-zinc-500">{player.gamesPlayed}</td>
                        <td className={`py-3.5 pr-5 text-right font-mono font-semibold ${player.netProfitCents >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {formatCurrency(player.netProfitCents)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Quick Inline Add to Roster Form */}
              <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-800">
                <form onSubmit={handleAddToRosterSubmit} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newPlayerName}
                    onChange={e => setNewPlayerName(e.target.value)}
                    placeholder="Register new player profile..."
                    className="flex-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                  <button type="submit" className="rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-1.5 text-sm font-semibold hover:bg-zinc-800 shadow-sm transition-all">
                    Register
                  </button>
                </form>
              </div>
            </div>

            {/* Room Historical Session Log */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800/70 rounded-xl shadow-sm p-5 space-y-4">
              <div>
                <h3 className="font-semibold text-base">Historical Match Ledger</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Past finalized logs hosted within this room structure.</p>
              </div>
              <div className="space-y-2">
                {history.map(session => (
                  <div key={session.id} className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/30 dark:bg-zinc-900/30 hover:border-zinc-200 transition-all">
                    <div>
                      <p className="text-sm font-semibold">{session.date}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{session.playerCount} Seated Entries</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold">{(session.totalPotCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}</p>
                      <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium cursor-pointer hover:underline mt-0.5">View Audit Logs</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Launch Session Configuration Panel */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800/70 rounded-xl shadow-sm p-5 space-y-5">
            <div>
              <h2 className="text-lg font-semibold">Start New Session</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Select active attendees from your permanent roster to seed the tables.</p>
            </div>

            {/* Attendance Checkbox Checklist */}
            <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg max-h-60 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 p-1 bg-zinc-50/20 dark:bg-zinc-950/20">
              {roster.map(player => {
                const isSelected = selectedRosterIds.includes(player.id);
                return (
                  <label key={player.id} className="flex items-center justify-between p-2.5 rounded-md cursor-pointer select-none hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleTogglePlayerSelection(player.id)}
                        className="h-4 w-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900"
                      />
                      <span className="text-sm font-medium">{player.name}</span>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Quick Session Configuration Inputs */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Default Game Buy-In ($)</label>
                <input
                  type="number"
                  step="1"
                  value={defaultBuyIn}
                  onChange={e => setDefaultBuyIn(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>
            </div>

            {/* Final Action Triggers */}
            <button
              onClick={handleLaunchSession}
              disabled={selectedRosterIds.length === 0}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 disabled:cursor-not-allowed py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 transition-all flex items-center justify-center gap-2"
            >
              Open Active Table ({selectedRosterIds.length} Seated)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}