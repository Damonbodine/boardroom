"use client";
import { MeetingsTable } from "@/components/meetings-table";

export default function MeetingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-primary">Meetings</h1>
      <MeetingsTable />
    </div>
  );
}
