"use client";
import { CommitteesTable } from "@/components/committees-table";

export default function CommitteesPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-primary">Committees</h1>
      <CommitteesTable />
    </div>
  );
}
