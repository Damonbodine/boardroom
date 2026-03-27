"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { MeetingForm } from "@/components/meeting-form";
import { RoleGuard } from "@/components/role-guard";

export default function EditMeetingPage() {
  const params = useParams();
  const meetingId = params.id as Id<"meetings">;
  const meeting = useQuery(api.meetings.get, { meetingId });

  if (!meeting) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading meeting...</div>
    );
  }

  const dateStr = new Date(meeting.date).toISOString().slice(0, 10);

  return (
    <RoleGuard allowedRoles={["Admin", "Staff"]}>
      <div className="max-w-2xl">
        <h1 className="font-serif text-3xl font-bold text-primary mb-6">Edit Meeting</h1>
        <MeetingForm
          meetingId={meetingId}
          defaultValues={{
            title: meeting.title,
            description: meeting.description,
            date: dateStr,
            startTime: meeting.startTime,
            endTime: meeting.endTime,
            location: meeting.location,
            meetingType: meeting.meetingType,
          }}
        />
      </div>
    </RoleGuard>
  );
}
