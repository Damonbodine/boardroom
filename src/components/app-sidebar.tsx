"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { withPreservedDemoQuery } from "@/lib/demo";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  CheckSquare,
  Bell,
  Settings,
  Gavel,
} from "lucide-react";

const adminNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Meetings", href: "/meetings", icon: Calendar },
  { label: "Action Items", href: "/action-items", icon: CheckSquare },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Committees", href: "/committees", icon: Users },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings/profile", icon: Settings },
];

const memberNav = [
  { label: "My Dashboard", href: "/member-dashboard", icon: LayoutDashboard },
  { label: "Meetings", href: "/meetings", icon: Calendar },
  { label: "Action Items", href: "/action-items", icon: CheckSquare },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Committees", href: "/committees", icon: Users },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings/profile", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUser = useQuery(api.users.getCurrent, {});
  const unreadCount = useQuery(api.notifications.getUnreadCount, {});

  const navItems = currentUser?.role === "Admin" ? adminNav : memberNav;

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="px-6 py-5 border-b border-sidebar-border">
        <Link
          href={withPreservedDemoQuery("/dashboard", searchParams)}
          className="flex items-center gap-3"
        >
          <Gavel className="h-7 w-7 text-sidebar-primary" />
          <span className="font-serif text-xl font-bold text-sidebar-foreground tracking-tight">
            BoardRoom
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={withPreservedDemoQuery(item.href, searchParams)} />}
                  isActive={isActive}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.label === "Notifications" && unreadCount && unreadCount.count > 0 && (
                    <SidebarMenuBadge>
                      <Badge className="bg-accent text-accent-foreground text-xs px-1.5 py-0">
                        {unreadCount.count}
                      </Badge>
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <UserButton  />
          {currentUser && (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-foreground">
                {currentUser.name}
              </span>
              <span className="text-xs text-sidebar-foreground/60">
                {currentUser.role}
              </span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
