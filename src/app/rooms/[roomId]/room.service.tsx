import { prisma } from "@/lib/prisma";

export interface RoomPlayerSummary {
  id: string;
  name: string;
  gamesPlayed: number;
  lifetimeNetCents: number;
  joinedAt: string;
}

export interface RoomSessionSummary {
  id: string;
  status: "ACTIVE" | "COMPLETED";
  smallBlind: number;
  bigBlind: number;
  dollarBuyIn: number;
  totalPotCents: number;
  startTime: string;
}

export interface RoomDetailsPayload {
  id: string;
  name: string;
  passcode: string;
  players: RoomPlayerSummary[];
  sessions: RoomSessionSummary[];
}

/**
 * Retrieves full room meta structure along with lists of associated profiles 
 * and historical cash tables, fully aligned with the application Prisma schema.
 */
export async function getRoomDetails(roomId: string): Promise<RoomDetailsPayload | null> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      players: {
        orderBy: { name: "asc" },
      },
      sessions: {
        orderBy: { startTime: "desc" }, // 🎯 Schema align: Ordering by startTime
        include: {
          playerRecords: true, // 🎯 Schema align: Pull ledger records to compute totals
        },
      },
    },
  });

  if (!room) return null;

  return {
    id: room.id,
    name: room.name,
    passcode: room.passcode,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      gamesPlayed: p.gamesPlayed, // 🎯 Schema align: Cached game counts
      lifetimeNetCents: p.lifetimeNetCents, // 🎯 Schema align: Lifetime financial metrics
      joinedAt: new Date(p.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    })),
    sessions: room.sessions.map((s) => ({
      id: s.id,
      status: s.status, // Matches exact "ACTIVE" | "COMPLETED" enum structure
      smallBlind: s.smallBlind,
      bigBlind: s.bigBlind,
      dollarBuyIn: s.dollarBuyIn,
      // Calculate total pot size dynamically using total buy-in chips * scaled game value
      totalPotCents: s.playerRecords.reduce((sum, rec) => sum + rec.buyInChips, 0) * (s.dollarBuyIn / s.startingChips) * 100,
      startTime: new Date(s.startTime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    })),
  };
}