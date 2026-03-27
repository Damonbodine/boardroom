"use client";
import { ActionItemsTable } from "@/components/action-items-table";

export default function ActionItemsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-primary">Action Items</h1>
      <ActionItemsTable />
    </div>
  );
}
