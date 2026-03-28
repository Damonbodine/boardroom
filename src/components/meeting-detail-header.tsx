"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Edit, Play, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

const typeColors: Record<string, string> = {
  Regular: "border-info/30 bg-info/15 text-info",
  Special: "border-primary/30 bg-primary/15 text-primary",
  Emergency: "border-destructive/30 bg-destructive/15 text-destructive",
  AnnualGeneral: "border-success/30 bg-success/15 text-success",
};

export function MeetingDetailHeader({ meetingId }: { meetingId: Id<"meetings"> }) {
  const meeting = useQuery(api.meetings.get, { meetingId });
  const currentUser = useQuery(api.users.getCurrent, {});
  const updateStatus = useMutation(api.meetings.updateStatus);

  if (!meeting) {
    return (
      <Card className="border">
        <CardContent className="pt-6">
          <div className="h-24 animate-pulse bg-muted" />
        </CardContent>
      </Card>
    );
  }

  const isAdmin = currentUser?.role === "Admin";

  const handleStatusChange = async (status: "Scheduled" | "InProgress" | "Completed" | "Cancelled") => {
    await updateStatus({ meetingId, status });
  };

  return (
    <Card className="border" data-demo="meeting-detail-header">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="font-serif text-2xl">{meeting.title}</CardTitle>
            {meeting.description && (
              <p className="text-muted-foreground text-sm">{meeting.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={typeColors[meeting.meetingType] || ""}>
              {meeting.meetingType === "AnnualGeneral" ? "AGM" : meeting.meetingType}
            </Badge>
            <StatusBadge status={meeting.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {new Date(meeting.date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {meeting.startTime} - {meeting.endTime}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {meeting.location}
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 mt-6 pt-4 border-t">
            <Link href={`/meetings/${meetingId}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1.5" />
                Edit
              </Button>
            </Link>
            {meeting.status === "Scheduled" && (
              <Button size="sm" onClick={() => handleStatusChange("InProgress")}>
                <Play className="h-4 w-4 mr-1.5" />
                Start Meeting
              </Button>
            )}
            {meeting.status === "InProgress" && (
              <Button size="sm" onClick={() => handleStatusChange("Completed")}>
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Complete
              </Button>
            )}
            {(meeting.status === "Scheduled" || meeting.status === "InProgress") && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleStatusChange("Cancelled")}
              >
                <XCircle className="h-4 w-4 mr-1.5" />
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
