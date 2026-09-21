import React from "react";
import { PageHeader } from "@/components/admin/PageHeader";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome to the RoadAssist Enterprise Admin Dashboard."
      />
      <div className="rounded-xl border border-border bg-card p-8 text-center text-xs text-muted-foreground">
        Operational telemetry and live dispatch statistics will be mounted here.
      </div>
    </div>
  );
}