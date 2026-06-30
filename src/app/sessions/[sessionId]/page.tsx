// src/app/sessions/[sessionId]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import { getSessionDetails } from "./session.service";
import SessionClientInteractive from "./SessionClient";

interface SessionPageProps {
  params: Promise<{ sessionId: string }>; // 🎯 Must match the folder name [sessionId] exactly
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params;
  
  // Quick console trace to confirm the loader engine is waking up
  console.log("🚀 ROOT LEVEL ROUTE DETECTED ID:", sessionId);

  if (!sessionId) return notFound();

  const sessionData = await getSessionDetails(sessionId);

  if (!sessionData) {
    return notFound();
  }

  return (
    <SessionClientInteractive 
      initialData={sessionData} 
      roomId={sessionData.roomId} 
      sessionId={sessionId} 
    />
  );
}