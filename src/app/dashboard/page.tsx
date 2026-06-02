"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PokerRoomSummary {
  id: string;
  name: string;
  memberCount: number;
  totalSessions: number;
  isLiveNow: boolean;
}

export default function GlobalDashboardPage() {
  const router = useRouter();
  
  // Mock listing of rooms this user hosts or belongs to (Will load from database later)
  const [rooms, setRooms] = useState<PokerRoomSummary[]>([
    { id: "sengkang-rounders", name: "Sengkang Rounders", memberCount: 5, totalSessions: 14, isLiveNow: false },
    { id: "friday-high-stakes", name: "Friday High Stakes", memberCount: 12, totalSessions: 32, isLiveNow: true },
    { id: "office-cash-game", name: "Office Cash Game", memberCount: 7, totalSessions: 3, isLiveNow: false },
  ]);

  // Modal & Form State Controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [passcode, setPasscode] = useState("");

  const handleCreateRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !passcode.trim()) return;

    // 1. In production, insert this data into your Supabase 'Room' table.
    // 2. Slugify or grab the random UUID returned from database to build the dynamic route.
    const uniqueRoomSlug = roomName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    // Optimistic state update for presentation layer simulation
    const newRoomRecord: PokerRoomSummary = {
      id: uniqueRoomSlug || crypto.randomUUID().substring(0, 8),
      name: roomName.trim(),
      memberCount: 1, // Host starts solo
      totalSessions: 0,
      isLiveNow: false,
    };

    setRooms(prev => [newRoomRecord, ...prev]);
    
    // Clear state fields and shield modal overlay
    setRoomName("");
    setPasscode("");
    setIsModalOpen(false);

    // 3. Command router to sweep user straight into the new room's dynamic lobby route
    router.push(`/rooms/${newRoomRecord.id}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 sm:p-10 text-zinc-900 dark:text-zinc-50">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Dashboard Title Branding Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Poker Management Control</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Select an active club room environment or initialize a new group circle.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm transition-all"
          >
            Create New Room
          </button>
        </div>

        {/* Global Overview Performance Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Tracked Club Rooms</p>
            <p className="text-3xl font-bold tracking-tight mt-1">{rooms.length}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Total Run Sessions</p>
            <p className="text-3xl font-bold tracking-tight mt-1">
              {rooms.reduce((acc, r) => acc + r.totalSessions, 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Total Unique Players</p>
            <p className="text-3xl font-bold tracking-tight mt-1">
              {rooms.reduce((acc, r) => acc + r.memberCount, 0)}
            </p>
          </div>
        </div>

        {/* Primary Rooms Interactive Directory */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Your Running Poker Rooms</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {rooms.map((room) => (
              <Link
                key={room.id}
                href={`/rooms/${room.id}`}
                className="group relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 p-5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all flex flex-col justify-between min-h-[140px]"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {room.name}
                    </h3>
                    
                    {room.isLiveNow && (
                      <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Table
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 font-mono">ID: {room.id}</p>
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/60 pt-3 mt-4">
                  <div>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">{room.memberCount}</span> Players
                  </div>
                  <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-800" />
                  <div>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">{room.totalSessions}</span> Sessions Hosted
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* "Create New Room" Clean Modal Sheet Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl animate-in fade-in-50 zoom-in-95 duration-150">
            <form onSubmit={handleCreateRoomSubmit} className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Setup Poker Room</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Establishes an isolated ledger playground with its own roster pool.</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Room Club Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  placeholder="e.g. Sengkang Crew"
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Access Passcode PIN (4 Digits)</label>
                <input
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={4}
                  required
                  value={passcode}
                  onChange={e => setPasscode(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 8888"
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3.5 py-1.5 text-sm font-semibold shadow hover:bg-zinc-800"
                >
                  Initialize Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}