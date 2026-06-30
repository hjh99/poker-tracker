import React from "react";
import { getDashboardData } from "./dashboard.service";
import DashboardClientInteractive from "./DashboardClient";

export default async function DashboardPage() {
  // 1. Safe backend server data fetch
  const dataPayload = await getDashboardData();

  // 2. Hand data off cleanly to the client layout canvas
  return <DashboardClientInteractive initialData={dataPayload} />;
}