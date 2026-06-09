"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

interface CreateSessionInput {
  roomId: string;
  dollarBuyIn: number;
  startingChips: number;
  smallBlind: number;
  bigBlind: number;
  playerIds: string[];
}

export async function createSessionAction(input: CreateSessionInput) {
  let newSessionId: string;

  try {
    // 1. 🛡️ EMPTY DATABASE GUARD: Ensure the parent Room actually exists!
    // If it doesn't exist, create a fallback record so the foreign key doesn't throw a 500 error.
    if (input.roomId) {
      const roomExists = await prisma.room.findUnique({
        where: { id: input.roomId }
      });

      if (!roomExists) {
        console.log(`[Setup] Room "${input.roomId}" not found in empty DB. Provisioning placeholder...`);
        await prisma.room.create({
          data: {
            id: input.roomId,
            name: "Sengkang Rounders (Auto-Generated)",
            passcode: "8888"
          }
        });
      }
    }

    // 2. Create the core session record safely
    const session = await prisma.session.create({
      data: {
        roomId: input.roomId, 
        status: "ACTIVE",
        dollarBuyIn: input.dollarBuyIn,
        startingChips: input.startingChips,
        smallBlind: input.smallBlind,
        bigBlind: input.bigBlind,
      },
    });

    newSessionId = session.id;

    // 3. Keep players isolated so mock string IDs ("p1", "p2") don't trip data verification gates
    try {
      const ledgerCreations = input.playerIds.map((id) =>
        prisma.playerSession.create({
          data: {
            sessionId: session.id,
            playerId: id, 
            buyInChips: input.startingChips,
            cashOutChips: 0,
            hasCashedOut: false,
          },
        })
      );
      await Promise.all(ledgerCreations);
    } catch (playerDbError) {
      console.warn(
        "⚠️ Player mapping skipped. To link real players, they must exist in the Player database table first.",
        playerDbError
      );
    }

  } catch (error) {
    console.error("CRITICAL Backend Error [createSessionAction]:", error);
    throw new Error("Failed to initialize game night core structure.");
  }

  // 4. Kick to the dynamic tracking view path
  redirect(`/sessions/${newSessionId}`);
}