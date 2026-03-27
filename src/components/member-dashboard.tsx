"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";
import {
  Calendar,
  Gavel,
  CheckSquare,
  Users,
  Clock,
  FileText,
  Bell,
} from "lucide-react";

export function MemberDashboard() {
  const stats = useQuery(api.dashboard.getMemberStats, {});
  const currentUser = useQuery(api.users.getCurrent, {});
  const meetings = useQuery(api.meetings.list, { status: "Scheduled" });
  const pendingMotions = useQuery(api.motions.listPending, { status: "Voting" });
  const unreadCount = useQuery(api.notifications.getUnreadCount, {});

  if (!stats || !currentUser) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="border">
              <CardContent className="pt-6">
                <div className="h-16 animate-pulse bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const memberStats = [
    { label: "My Meetings", value: stats.myUpcomingMeetings, icon: Calendar, color: "text-blue-600" },
    { label: "Pending Votes", value: stats.myPendingVotes, icon: Gavel, color: "text-amber-600" },
    { label: "My Action Items", value: stats.myActionItems, icon: CheckSquare, color: "text-green-600" },
    { label: "My Committees", value: stats.myCommittees, icon: Users, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold">
          Welcome back, {currentUser.name}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {currentUser.title && `${currentUser.title} | `}{currentUser.role}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {memberStats.map((stat) => (
          <Card key={stat.label} className="border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold font-serif mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border">
          <CardHeader>
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Upcoming Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!meetings || meetings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming meetings.
              </p>
            ) : (
              <div className="space-y-3">
                {meetings.slice(0, 5).map((meeting) => (
                  <Link
                    key={meeting._id}
                    href={`/meetings/${meeting._id}`}
                    className="block p-3 border hover:bg-muted/50 transition-colors"
                  >
                    <p className="font-medium text-sm">{meeting.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(meeting.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                        {" "}{meeting.startTime}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {meeting.meetingType}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <Gavel className="h-5 w-5 text-accent" />
              Pending Votes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!pendingMotions || pendingMotions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No pending votes.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingMotions.slice(0, 5).map((motion) => (
                  <div
                    key={motion._id}
                    className="p-3 border hover:bg-muted/50 transition-colors"
                  >
                    <p className="font-medium text-sm">{motion.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={motion.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {unreadCount && unreadCount.count > 0 && (
        <Card className="border border-l-2 border-l-accent">
          <CardContent className="py-4">
            <Link
              href="/notifications"
              className="flex items-center gap-3 text-sm hover:text-accent transition-colors"
            >
              <Bell className="h-5 w-5 text-accent" />
              <span>You have <strong>{unreadCount.count}</strong> unread notification{unreadCount.count > 1 ? "s" : ""}.</span>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
