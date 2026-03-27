"use client";
import { CommitteeForm } from "@/components/committee-form";
import { RoleGuard } from "@/components/role-guard";

export default function NewCommitteePage() {
  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <div className="max-w-2xl">
        <CommitteeForm />
      </div>
    </RoleGuard>
  );
}
