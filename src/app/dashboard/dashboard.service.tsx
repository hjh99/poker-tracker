import { prisma } from "@/lib/prisma";

export interface DashboardRoomSummary {
  id: string;
  name: string;
  passcode: string;
  playerCount: number;
  sessionCount: number;
  createdAt: string;
}

export interface DashboardStats {
  totalRooms: number;
  totalPlayers: number;
  totalCompletedSessions: number;
}

export interface DashboardPayload {
  stats: DashboardStats;
  rooms: DashboardRoomSummary[];
}

/**
 * Fetches and bundles high-level metrics and room listings for the user's dashboard view.
 */
export async function getDashboardData(): Promise<DashboardPayload> {
  // 1. Fetch rooms along with relation counts to build summaries
  const rooms = await prisma.room.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          players: true,
          sessions: true,
        },
      },
    },
  });

  // 2. Aggregate global high-level stats across the entire application platform
  const totalRooms = rooms.length;
  
  const totalPlayers = await prisma.player.count();
  
  const totalCompletedSessions = await prisma.session.count({
    where: { status: "COMPLETED" },
  });

  // 3. Map database rows into structured data definitions for UI elements
  const formattedRooms: DashboardRoomSummary[] = rooms.map((room) => ({
    id: room.id,
    name: room.name,
    passcode: room.passcode,
    playerCount: room._count.players,
    sessionCount: room._count.sessions,
    createdAt: new Date(room.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }));

  return {
    stats: {
      totalRooms,
      totalPlayers,
      totalCompletedSessions,
    },
    rooms: formattedRooms,
  };
}