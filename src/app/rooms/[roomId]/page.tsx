import React from "react";
import { notFound } from "next/navigation";
import { getRoomDetails } from "./room.service";
import RoomClient from "./RoomClient";

interface RoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  // Destructure dynamic folder slug string matching [roomId] asynchronously
  const { roomId } = await params;

  // 1. Trigger isolated data loader on server side
  const roomPayload = await getRoomDetails(roomId);

  if (!roomPayload) {
    notFound();
  }

  // 2. Hydrate client state by feeding properties down
  return <RoomClient initialData={roomPayload} />;
}