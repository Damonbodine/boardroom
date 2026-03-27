"use client";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const user = useQuery(api.users.getCurrent, {});
  const router = useRouter();

  useEffect(() => {
    if (user && !allowedRoles.includes(user.role)) {
      if (user.role === "Admin") router.replace("/dashboard");
      else if (user.role === "BoardMember") router.replace("/member-dashboard");
      else router.replace("/meetings");
    }
  }, [user, allowedRoles, router]);

  if (!user) return fallback || <div className="flex h-screen items-center justify-center"><div className="text-muted-foreground">Loading...</div></div>;
  if (!allowedRoles.includes(user.role)) return null;
  return <>{children}</>;
}