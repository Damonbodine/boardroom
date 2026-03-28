"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DemoMode } from "@/components/demo-mode";

export function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="p-8">
          {children}
        </main>
        <DemoMode />
      </SidebarInset>
    </SidebarProvider>
  );
}
