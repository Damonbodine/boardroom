"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Bell,
  Calendar,
  Gavel,
  FileText,
  CheckSquare,
  AlertTriangle,
  Info,
  CheckCheck,
} from "lucide-react";

const typeIcons: Record<string, React.ElementType> = {
  MeetingScheduled: Calendar,
  MeetingReminder: Calendar,
  VoteRequired: Gavel,
  DocumentShared: FileText,
  ActionItemAssigned: CheckSquare,
  MinutesPublished: FileText,
  SystemAlert: AlertTriangle,
};

const typeColors: Record<string, string> = {
  MeetingScheduled: "text-blue-600",
  MeetingReminder: "text-blue-600",
  VoteRequired: "text-amber-600",
  DocumentShared: "text-purple-600",
  ActionItemAssigned: "text-green-600",
  MinutesPublished: "text-purple-600",
  SystemAlert: "text-red-600",
};

export function NotificationsList() {
  const notifications = useQuery(api.notifications.listMine, {});
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);

  if (!notifications) {
    return <div className="p-8 text-center text-muted-foreground">Loading notifications...</div>;
  }

  if (notifications.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <Bell className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p className="font-serif text-lg">No notifications</p>
        <p className="text-sm mt-1">You are all caught up.</p>
      </div>
    );
  }

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="space-y-4">
      {hasUnread && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllRead()}
            className="text-muted-foreground"
          >
            <CheckCheck className="h-4 w-4 mr-1.5" />
            Mark all as read
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((notification) => {
          const Icon = typeIcons[notification.type] || Info;
          const iconColor = typeColors[notification.type] || "text-muted-foreground";

          return (
            <Card
              key={notification._id}
              className={cn(
                "border cursor-pointer transition-colors hover:bg-muted/50",
                !notification.isRead && "border-l-2 border-l-accent bg-accent/5"
              )}
              onClick={() => {
                if (!notification.isRead) {
                  markRead({ notificationId: notification._id });
                }
              }}
            >
              <CardContent className="py-3 px-4">
                <div className="flex items-start gap-3">
                  <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", iconColor)} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", !notification.isRead && "font-medium")}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="h-2 w-2 bg-accent shrink-0 mt-2" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
