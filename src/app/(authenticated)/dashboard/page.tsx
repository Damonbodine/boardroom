"use client";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { DashboardStats } from "@/components/dashboard-stats";
import { MeetingsTable } from "@/components/meetings-table";
import { ActivityFeed } from "@/components/activity-feed";
import { ActionItemsTable } from "@/components/action-items-table";
import { RoleGuard } from "@/components/role-guard";

export default function DashboardPage() {
  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <div className="space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back. Here is your governance overview.</p>
        </div>
        <DashboardStats />
        <div className="grid grid-cols-2 gap-6">
          <MeetingsTable />
          <ActionItemsTable />
        </div>
        <ActivityFeed />
      </div>
    </RoleGuard>
  );
}
