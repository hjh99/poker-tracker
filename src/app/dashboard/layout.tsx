import { prisma } from "@/lib/prisma";
import GlobalDashboardPage from "./page";

export const revalidate = 0; // Force dynamic rendering so updates appear instantly

export default async function DashboardServerContainer() {
  // Query all rooms along with related session and player counts
  const DB_Rooms = await prisma.room.findMany({
    include: {
      _count: {
        select: {
          players: true,   // Count linked members
          sessions: true,  // Count overall hosted logs
        }
      },
      sessions: {
        select: {
          status: true // Used to infer whether an active table is live right now
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // Transform relational data into the flat structure your template expects
  const formattedRooms = DB_Rooms.map(room => ({
    id: room.id,
    name: room.name,
    memberCount: room._count.players,
    totalSessions: room._count.sessions,
    // True if any session tied to this room has an "ACTIVE" status
    isLiveNow: room.sessions.some(s => s.status === "ACTIVE")
  }));

  return <GlobalDashboardPage initialRooms={formattedRooms} />;
}