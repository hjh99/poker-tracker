"use client";

import React from "react";

// Money fields are treated explicitly as integers in cents
interface Player {
  id: string;
  name: string;
  buyInCents: number;
  cashOutCents: number | null;
  hasCashedOut: boolean;
}

interface PlayerRowProps {
  player: Player;
  onQuickRebuy: (id: string) => void;
  onOpenCustomTopUp: (player: Player) => void;
  onOpenCashOut: (player: Player) => void;
}

export default function PlayerRow({
  player,
  onQuickRebuy,
  onOpenCustomTopUp,
  onOpenCashOut,
}: PlayerRowProps) {
  // Compute net results: Cash out amount minus total buy-in
  const totalBuyIn = player.buyInCents;
  const currentCashOut = player.cashOutCents || 0;
  const netResult = currentCashOut - totalBuyIn;
  
  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  return (
    <tr className="border-b border-zinc-100 dark:border-zinc-800 text-sm hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
      {/* Player Identity */}
      <td className="py-4 pl-4 font-medium text-zinc-900 dark:text-zinc-100">
        {player.name}
        {player.hasCashedOut && (
          <span className="ml-2 inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Cashed Out
          </span>
        )}
      </td>

      {/* Total Invested (Buy-ins) */}
      <td className="py-4 text-zinc-600 dark:text-zinc-400 tabular-nums">
        {formatCurrency(player.buyInCents)}
      </td>

      {/* Final Stack Value */}
      <td className="py-4 text-zinc-600 dark:text-zinc-400 tabular-nums">
        {player.hasCashedOut ? formatCurrency(currentCashOut) : "—"}
      </td>

      {/* Net Profit / Loss Margin */}
      <td className="py-4 tabular-nums font-medium">
        {player.hasCashedOut || player.cashOutCents !== null ? (
          <span className={netResult >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
            {netResult > 0 ? "+" : ""}
            {formatCurrency(netResult)}
          </span>
        ) : (
          <span className="text-zinc-400 dark:text-zinc-500">
            Uncalculated
          </span>
        )}
      </td>

      {/* Fintech Action Panel */}
      <td className="py-4 pr-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {!player.hasCashedOut ? (
            <>
              <button
                onClick={() => onQuickRebuy(player.id)}
                className="rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                +$50
              </button>
              <button
                onClick={() => onOpenCustomTopUp(player)}
                className="rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                Top-up
              </button>
              <button
                onClick={() => onOpenCashOut(player)}
                className="rounded-md bg-zinc-900 dark:bg-zinc-100 px-2.5 py-1.5 text-xs font-semibold text-white dark:text-zinc-900 shadow hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
              >
                Cash out
              </button>
            </>
          ) : (
            <button
              onClick={() => onOpenCashOut(player)}
              className="text-xs font-medium text-zinc-500 dark:text-zinc-400 underline hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Edit Stack
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}