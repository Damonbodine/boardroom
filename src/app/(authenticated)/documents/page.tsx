"use client";
import { DocumentsTable } from "@/components/documents-table";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-primary">Documents</h1>
      <DocumentsTable />
    </div>
  );
}
