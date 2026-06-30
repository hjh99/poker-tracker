"use server"; // 🚀 Marks all exported actions in this file as secure server endpoints

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ActivePlayerRecord {
  id: string;
  playerId: string;
  name: string;
  buyInChips: number;
  cashOutChips: number | null;
  hasCashedOut: boolean;
  buyInAmountDollars: number;
  netProfitDollars: number | null;
}

export interface SessionDetailsSnapshot {
  id: string;
  roomId: string; // 🎯 Resolved directly via database foreign key relation
  status: "ACTIVE" | "COMPLETED";
  dollarBuyIn: number;
  startingChips: number;
  smallBlind: number;
  bigBlind: number;
  totalPotDollars: number;
  players: ActivePlayerRecord[];
}

/**
 * READ: Fetches complete live session state and scales chip metrics into real dollars.
 */
export async function getSessionDetails(sessionId: string): Promise<SessionDetailsSnapshot | null> {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        playerRecords: {
          include: { player: true },
          orderBy: { player: { name: "asc" } },
        },
      },
    });

    if (!session) return null;

    // Safety check to prevent dividing by zero
    if (!session.startingChips || session.startingChips === 0) return null;

    const chipValueMultiplier = session.dollarBuyIn / session.startingChips;
    let totalPotChips = 0;

    const players: ActivePlayerRecord[] = session.playerRecords.map((rec) => {
      totalPotChips += rec.buyInChips;
      const buyInAmountDollars = rec.buyInChips * chipValueMultiplier;
      let netProfitDollars = null;

      if (rec.cashOutChips !== null) {
        netProfitDollars = (rec.cashOutChips * chipValueMultiplier) - buyInAmountDollars;
      }

      return {
        id: rec.id,
        playerId: rec.playerId,
        name: rec.player?.name || "Unknown Player",
        buyInChips: rec.buyInChips,
        cashOutChips: rec.cashOutChips,
        hasCashedOut: rec.hasCashedOut,
        buyInAmountDollars,
        netProfitDollars,
      };
    });

    return {
      id: session.id,
      roomId: session.roomId,
      status: session.status as "ACTIVE" | "COMPLETED",
      dollarBuyIn: session.dollarBuyIn,
      startingChips: session.startingChips,
      smallBlind: session.smallBlind,
      bigBlind: session.bigBlind,
      totalPotDollars: totalPotChips * chipValueMultiplier,
      players,
    };
  } catch (error) {
    console.error("💥 Error in getSessionDetails:", error);
    return null;
  }
}

/**
 * MUTATION: Adds a standard starting chip stack to an active seat (Rebuy)
 */
export async function processRebuyAction(playerSessionId: string, additionalChips: number, path: string) {
  await prisma.playerSession.update({
    where: { id: playerSessionId },
    data: {
      buyInChips: { increment: additionalChips },
    },
  });
  revalidatePath(path);
}

/**
 * MUTATION: Settles a player's seat out with their final physical chip stack count
 */
export async function processCashOutAction(playerSessionId: string, finalChips: number, path: string) {
  await prisma.playerSession.update({
    where: { id: playerSessionId },
    data: {
      cashOutChips: finalChips,
      hasCashedOut: true,
    },
  });
  revalidatePath(path);
}

/**
 * MUTATION: Ends the active game session and finalizes table states
 */
export async function endSessionAction(sessionId: string, path: string) {
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      status: "COMPLETED",
      endTime: new Date(),
    },
  });
  revalidatePath(path);
}