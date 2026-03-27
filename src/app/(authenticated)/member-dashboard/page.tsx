"use client";
import { MemberDashboard } from "@/components/member-dashboard";
import { RoleGuard } from "@/components/role-guard";

export default function MemberDashboardPage() {
  return (
    <RoleGuard allowedRoles={["BoardMember"]}>
      <MemberDashboard />
    </RoleGuard>
  );
}
