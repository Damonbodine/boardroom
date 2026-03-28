"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";

const typeColors: Record<string, string> = {
  Regular: "border-info/30 bg-info/15 text-info",
  Special: "border-primary/30 bg-primary/15 text-primary",
  Emergency: "border-destructive/30 bg-destructive/15 text-destructive",
  AnnualGeneral: "border-success/30 bg-success/15 text-success",
};

export function MeetingsTable() {
  const meetings = useQuery(api.meetings.list, {});

  if (!meetings) {
    return <div className="p-8 text-center text-muted-foreground">Loading meetings...</div>;
  }

  if (meetings.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p className="font-serif text-lg">No meetings found</p>
        <p className="text-sm mt-1">Create a new meeting to get started.</p>
      </div>
    );
  }

  return (
    <div data-demo="meetings-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-serif">Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meetings.map((meeting, index) => (
            <TableRow
              key={meeting._id}
              className="hover:bg-muted/50"
              data-demo={index === 0 ? "primary-meeting-row" : undefined}
            >
              <TableCell>
                <Link
                  href={`/meetings/${meeting._id}`}
                  className="font-medium text-primary hover:text-accent transition-colors"
                >
                  {meeting.title}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(meeting.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {meeting.startTime}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={typeColors[meeting.meetingType] || ""}>
                  {meeting.meetingType === "AnnualGeneral" ? "AGM" : meeting.meetingType}
                </Badge>
              </TableCell>
              <TableCell>
                <StatusBadge status={meeting.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
