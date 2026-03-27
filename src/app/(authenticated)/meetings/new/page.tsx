"use client";
import { MeetingForm } from "@/components/meeting-form";
import { RoleGuard } from "@/components/role-guard";

export default function NewMeetingPage() {
  return (
    <RoleGuard allowedRoles={["Admin", "Staff"]}>
      <div className="max-w-2xl">
        <h1 className="font-serif text-3xl font-bold text-primary mb-6">Create Meeting</h1>
        <MeetingForm />
      </div>
    </RoleGuard>
  );
}
