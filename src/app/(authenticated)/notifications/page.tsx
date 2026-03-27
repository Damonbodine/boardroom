"use client";
import { NotificationsList } from "@/components/notifications-list";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-primary">Notifications</h1>
      <NotificationsList />
    </div>
  );
}
