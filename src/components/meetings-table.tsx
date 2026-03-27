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
  Regular: "bg-blue-100 text-blue-800",
  Special: "bg-purple-100 text-purple-800",
  Emergency: "bg-red-100 text-red-800",
  AnnualGeneral: "bg-green-100 text-green-800",
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
        {meetings.map((meeting) => (
          <TableRow key={meeting._id} className="hover:bg-muted/50">
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
  );
}
