// src/app/actions/players.ts
"use server"
import { prisma } from "@/lib/prisma"

export async function getPlayersByRoom(roomId: string) {
  return await prisma.player.findMany({
    where: { roomId },
    orderBy: { name: "asc" }
  });
}