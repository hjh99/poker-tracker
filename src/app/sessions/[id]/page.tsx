import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionDashboardPage({ params }: SessionPageProps) {
  const { id: sessionId } = await params;

  // 1. Fetch the core session object first
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      room: true, // Fetch room configuration details
    },
  });

  if (!session) {
    notFound();
  }

  // 2. Fetch the player session connections explicitly by querying the table directly.
  // This bypasses any internal naming variations in the Session include block!
  const connectedPlayers = await prisma.playerSession.findMany({
    where: {
      sessionId: session.id,
    },
    include: {
      player: true, // Pull individual player metadata profiles
    },
  });

  // Server Action inline handler to manage rebuys directly at the table layout
  async function handleTopUp(playerSessionId: string, currentChips: number) {
    "use server";
    
    if (!session) return;

    await prisma.playerSession.update({
      where: { id: playerSessionId },
      data: {
        buyInChips: currentChips + session.dollarBuyIn,
      },
    });

    revalidatePath(`/sessions/${sessionId}`);
  }

  // Calculate overall table metrics safely
  const totalPlayers = connectedPlayers.length;
  const totalPrizePool = connectedPlayers.reduce((sum, p) => sum + p.buyInChips, 0);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Info Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md flex justify-between items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Active Game Night Ledger
          </span>
          <h1 className="text-3xl font-bold">{session.room?.name || "Casual Home Game"}</h1>
          <p className="text-sm text-slate-400 mt-1">
            Session ID: <code className="text-xs text-slate-300">{session.id.slice(0, 8)}...</code>
          </p>
        </div>
        
        <div className="text-right space-y-1">
          <div className="bg-slate-800 px-3 py-1 rounded-md border border-slate-700 text-sm">
            Blinds: <strong className="text-emerald-400">{session.bigBlind / 2} / {session.bigBlind}</strong>
          </div>
          <div className="bg-slate-800 px-3 py-1 rounded-md border border-slate-700 text-sm">
            Base Buy-in: <strong className="text-emerald-400">${session.dollarBuyIn}</strong>
          </div>
        </div>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Seated Players</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totalPlayers}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Total Cash in Play</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">${totalPrizePool}</p>
        </div>
      </div>

      {/* Main Players Roster Ledger */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="border-b px-6 py-4 bg-slate-50">
          <h2 className="font-semibold text-slate-800">Table Ledger</h2>
        </div>
        
        <div className="divide-y">
          {connectedPlayers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No players mapped to this tracking log yet.
            </div>
          ) : (
            connectedPlayers.map((item) => (
              <div key={item.id} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-semibold text-slate-800 text-lg">{item.player.name}</p>
                  <p className="text-xs text-slate-400">Player UUID: {item.player.id.slice(0, 8)}...</p>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-400 uppercase">Total Buy-in</p>
                    <p className="text-xl font-bold text-slate-900">${item.buyInChips}</p>
                  </div>
                  
                  {/* Action Form to process Rebuys / Add-ons */}
                  <form action={handleTopUp.bind(null, item.id, item.buyInChips)}>
                    <button
                      type="submit"
                      className="bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-medium px-3 py-1.5 rounded-lg border text-sm transition-all shadow-sm active:scale-95"
                    >
                      + ${session.dollarBuyIn} Rebuy
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}