"use client"; // 🚀 Marked clearly at the top for Next.js

import React, { useState } from "react";
import Link from "next/link";
import type { DashboardPayload, DashboardRoomSummary } from "./dashboard.service";

export default function DashboardClientInteractive({ initialData }: { initialData: DashboardPayload }) {
  const [rooms] = useState<DashboardRoomSummary[]>(initialData.rooms);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.passcode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-8">
      {/* Upper Heading Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Poker Club Central</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage your local home game venues, track physical chip distribution, and audit lifetime earnings ledger.
          </p>
        </div>
        <div>
          <Link
            href="/rooms/create"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            + Create New Room
          </Link>
        </div>
      </div>

      {/* Global Application Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Clubs / Rooms</p>
          <p className="text-2xl font-bold font-mono mt-1 text-zinc-900 dark:text-zinc-100">
            {initialData.stats.totalRooms}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Registered Players</p>
          <p className="text-2xl font-bold font-mono mt-1 text-zinc-900 dark:text-zinc-100">
            {initialData.stats.totalPlayers}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Archived Sessions</p>
          <p className="text-2xl font-bold font-mono mt-1 text-zinc-900 dark:text-zinc-100">
            {initialData.stats.totalCompletedSessions}
          </p>
        </div>
      </div>

      {/* Search Bar Utilities */}
      <div className="flex items-center gap-2 max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter rooms by name or entry PIN code..."
          className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
        />
      </div>

      {/* Primary Rooms Grid Matrix */}
      {filteredRooms.length === 0 ? (
        <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center">
          <p className="text-sm text-zinc-400 italic">No poker tracking hubs discovered matching that context.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-5 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {room.name}
                  </h3>
                  <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 font-semibold text-zinc-600 dark:text-zinc-400">
                    PIN: {room.passcode}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-medium">Created on {room.createdAt}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 my-5 border-t border-b border-zinc-100 dark:border-zinc-800/60 py-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-zinc-400">Roster Pool</p>
                  <p className="font-mono font-bold mt-0.5">{room.playerCount} Members</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-400">Total Games</p>
                  <p className="font-mono font-bold mt-0.5">{room.sessionCount} Run</p>
                </div>
              </div>

              <Link
                href={`/rooms/${room.id}`}
                className="w-full inline-flex items-center justify-center rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 py-2 text-xs font-semibold tracking-wide transition-colors text-zinc-700 dark:text-zinc-300"
              >
                Enter Room Lobby →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}