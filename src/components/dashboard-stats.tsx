"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Gavel, AlertTriangle, Users } from "lucide-react";

const statConfig = [
  { key: "upcomingMeetings" as const, label: "Upcoming Meetings", icon: Calendar, color: "text-info" },
  { key: "pendingMotions" as const, label: "Open Motions", icon: Gavel, color: "text-warning" },
  { key: "overdueActionItems" as const, label: "Overdue Items", icon: AlertTriangle, color: "text-destructive" },
  { key: "activeMembers" as const, label: "Active Members", icon: Users, color: "text-success" },
];

export function DashboardStats() {
  const stats = useQuery(api.dashboard.getAdminStats, {});

  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="border">
            <CardContent className="pt-6">
              <div className="h-16 animate-pulse bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div
      data-demo="dashboard-stats"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
    >
      {statConfig.map((stat) => (
        <Card key={stat.key} className="border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold font-serif mt-1">
                  {stats[stat.key]}
                </p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
