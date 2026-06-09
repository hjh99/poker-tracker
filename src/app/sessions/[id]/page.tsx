import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ActiveSessionClient from "./ActiveSessionClient";

interface SessionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params;

  // 1. Fetch using your exact schema relation key: playerRecords
  const sessionData = await prisma.session.findUnique({
    where: { id },
    include: {
      room: true,
      playerRecords: { 
        include: {
          player: true,
        },
        orderBy: {
          player: {
            name: "asc",
          },
        },
      },
    },
  });

  if (!sessionData) {
    notFound();
  }

  // 2. Compute live game calculations matching your chip-count schema fields
  const totalPlayers = sessionData.playerRecords.length;
  
  const totalBuyIns = sessionData.playerRecords.reduce(
    (sum, pr) => sum + (pr.buyInChips || 0), 
    0
  );
  
  const totalCurrentChips = sessionData.playerRecords.reduce(
    (sum, pr) => sum + (pr.cashOutChips || 0), 
    0
  );

  const tableStats = {
    totalPlayers,
    totalBuyIns,
    totalCurrentChips,
    isBalanced: totalBuyIns === totalCurrentChips,
  };

  // 3. 🧠 The Bridge: Format the data so your ActiveSessionClient frontend interface stays happy!
  const formattedSession = {
    id: sessionData.id,
    roomId: sessionData.roomId,
    status: sessionData.status,
    playerSessions: sessionData.playerRecords.map((pr) => ({
      id: pr.id,
      playerId: pr.playerId,
      sessionId: pr.sessionId,
      totalBuyIn: pr.buyInChips,      // Maps schema buyInChips -> frontend totalBuyIn
      currentChips: pr.cashOutChips || 0, // Maps schema cashOutChips -> frontend currentChips
      player: pr.player,
    })),
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Metadata Section */}
        <div className="border-b border-zinc-800 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-500 font-bold">
              Live Session • {sessionData.status}
            </span>
            <h1 className="text-2xl font-bold tracking-tight mt-1">
              {sessionData.room?.name || "Poker Table Room"}
            </h1>
            <p className="text-zinc-500 text-xs font-mono mt-0.5">
              Session ID: {sessionData.id}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-right">
              <div className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Total Buy-In Chips</div>
              <div className="text-sm font-bold font-mono text-emerald-400">{tableStats.totalBuyIns}</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-right">
              <div className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Total Chips Out</div>
              <div className="text-sm font-bold font-mono text-blue-400">{tableStats.totalCurrentChips}</div>
            </div>
          </div>
        </div>

        {/* Hand off data perfectly to your client dashboard */}
        <ActiveSessionClient 
          initialSession={formattedSession} 
          tableStats={tableStats} 
        />

      </div>
    </main>
  );
}