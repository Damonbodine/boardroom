"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Vote,
  Upload,
  LogIn,
  Activity,
} from "lucide-react";

const actionIcons: Record<string, React.ElementType> = {
  Create: Plus,
  Update: Edit,
  Delete: Trash2,
  StatusChange: RefreshCw,
  Vote: Vote,
  Upload: Upload,
  Login: LogIn,
};

const actionColors: Record<string, string> = {
  Create: "bg-green-100 text-green-700",
  Update: "bg-blue-100 text-blue-700",
  Delete: "bg-red-100 text-red-700",
  StatusChange: "bg-amber-100 text-amber-700",
  Vote: "bg-purple-100 text-purple-700",
  Upload: "bg-teal-100 text-teal-700",
  Login: "bg-muted text-muted-foreground",
};

export function ActivityFeed() {
  const activity = useQuery(api.dashboard.getRecentActivity, { limit: 15 });

  if (!activity) {
    return (
      <Card className="border">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="font-serif text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-accent" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No recent activity to display.
          </p>
        ) : (
          <div className="space-y-1">
            {activity.map((entry) => {
              const Icon = actionIcons[entry.action] || Activity;
              const color = actionColors[entry.action] || "bg-muted text-muted-foreground";

              return (
                <div
                  key={entry._id}
                  className="flex items-center gap-3 py-2.5 border-b last:border-b-0"
                >
                  <div className={`p-1.5 ${color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{entry.userName || "System"}</span>
                      {" "}
                      <span className="text-muted-foreground">
                        {entry.action.toLowerCase()}d
                      </span>
                      {" "}
                      <span className="text-muted-foreground">
                        {entry.entityType}
                      </span>
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground/60 shrink-0">
                    {new Date(entry.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
