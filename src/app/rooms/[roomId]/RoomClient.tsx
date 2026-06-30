"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { createSessionAction } from "@/app/actions/session";
import type { RoomDetailsPayload, RoomPlayerSummary } from "./room.service";

export default function RoomClient({ initialData }: { initialData: RoomDetailsPayload }) {
  const [isPending, startTransition] = useTransition();

  // Initialize roster state directly from the backend data payload snapshot
  const [roster, setRoster] = useState<RoomPlayerSummary[]>(initialData.players);

  // Selection array for tracking active game attendees
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(
    initialData.players.slice(0, 3).map((p) => p.id)
  );
  const [newPlayerName, setNewPlayerName] = useState("");
  const [defaultBuyIn, setDefaultBuyIn] = useState("50.00");

  const handleTogglePlayerSelection = (id: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddToRosterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    const newPlayer: RoomPlayerSummary = {
      id: crypto.randomUUID(),
      name: newPlayerName.trim(),
      gamesPlayed: 0,
      lifetimeNetCents: 0,
      joinedAt: new Date().toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      }),
    };

    setRoster((prev) => [...prev, newPlayer]);
    setSelectedPlayerIds((prev) => [...prev, newPlayer.id]);
    setNewPlayerName("");
  };

  const handleLaunchSession = () => {
    if (selectedPlayerIds.length === 0) return;
    const buyInDollars = Math.round(parseFloat(defaultBuyIn)) || 50;

    startTransition(async () => {
      try {
        await createSessionAction({
          roomId: initialData.id,
          dollarBuyIn: buyInDollars,
          startingChips: 500,
          smallBlind: 5,
          bigBlind: 10,
          playerIds: selectedPlayerIds,
        });
      } catch (err) {
        console.error(err);
        alert("An error occurred while spinning up the active table session.");
      }
    });
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString("en-US", {
      style: "currency", currency: "USD", signDisplay: "always",
    });
  };

  return (
    <div className="p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Breadcrumb Line */}
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          ← Back to Dashboard
        </Link>

        {/* Dynamic Room Heading Metadata Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{initialData.name}</h1>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm font-mono tracking-widest text-zinc-600 dark:text-zinc-400">
            PIN: {initialData.passcode}
          </div>
        </div>

        {/* Core Layout Panels Matrix Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT AREA: Club Roster Directory and Match logs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-xs text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                    <th className="p-4">Player Name</th>
                    <th className="p-4 text-center">Games</th>
                    <th className="p-4 text-right">Lifetime Profit</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-zinc-100 dark:divide-zinc-800">
                  {roster.map((player) => (
                    <tr key={player.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                      <td className="p-4 font-medium">{player.name}</td>
                      <td className="p-4 text-center text-zinc-500 font-mono">{player.gamesPlayed}</td>
                      <td className={`p-4 text-right font-mono font-semibold ${player.lifetimeNetCents >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {formatCurrency(player.lifetimeNetCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Roster Add Form Input */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-800">
                <form onSubmit={handleAddToRosterSubmit} className="flex gap-2">
                  <input
                    type="text" required value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="Register new player profile..."
                    className="flex-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                  <button type="submit" className="rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 text-sm font-semibold hover:bg-zinc-800 transition-colors">
                    Register
                  </button>
                </form>
              </div>
            </div>

            {/* Past Games Historical Match Log */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
              <div>
                <h3 className="font-semibold text-base">Historical Match Ledger</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Past finalized logs hosted within this room structure.</p>
              </div>
              <div className="space-y-2">
                {initialData.sessions.length === 0 ? (
                  <p className="text-xs text-zinc-400 p-2 italic">No past sessions recorded for this room.</p>
                ) : (
                  initialData.sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/30 dark:bg-zinc-900/30 hover:border-zinc-200 transition-all"
                    >
                      <div>
                        <p className="text-sm font-semibold">Blinds: {session.smallBlind}/{session.bigBlind}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{session.startTime}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(session.totalPotCents)}
                        </p>
                        <Link
                          href={`/rooms/${initialData.id}/sessions/${session.id}`}
                          className="text-xs text-indigo-500 dark:text-indigo-400 font-medium hover:underline mt-0.5 inline-block"
                        >
                          View Audit Logs →
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Active Checkbox Attendance Panel */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-5 shadow-sm h-fit">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Start New Session</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Select active attendees from your permanent roster to seed the tables.</p>
            </div>

            <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg p-1 max-h-60 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
              {roster.map((player) => (
                <label key={player.id} className="flex items-center gap-3 p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer text-sm font-medium select-none">
                  <input
                    type="checkbox" checked={selectedPlayerIds.includes(player.id)} disabled={isPending}
                    onChange={() => handleTogglePlayerSelection(player.id)}
                    className="rounded border-zinc-300 text-zinc-950 focus:ring-zinc-900 dark:bg-zinc-900 dark:border-zinc-800"
                  />
                  {player.name}
                </label>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Buy-In ($)</label>
              <input
                type="number" disabled={isPending} value={defaultBuyIn} onChange={(e) => setDefaultBuyIn(e.target.value)}
                className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>

            <button
              onClick={handleLaunchSession} disabled={selectedPlayerIds.length === 0 || isPending}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:text-zinc-400 py-3 text-sm font-semibold text-white transition-colors shadow-sm"
            >
              {isPending ? "Spinning Up Table..." : `Open Active Table (${selectedPlayerIds.length} Seated)`}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}