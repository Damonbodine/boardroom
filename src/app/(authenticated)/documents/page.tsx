"use client";
import { DocumentsTable } from "@/components/documents-table";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export default function DocumentsPage() {
  const currentUser = useQuery(api.users.getCurrent, {});
  const canUpload = currentUser?.role === "Admin" || currentUser?.role === "Staff";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-primary">Documents</h1>
        {canUpload && (
          <Link href="/documents/upload">
            <Button>
              <Upload className="h-4 w-4 mr-1.5" />
              Upload Document
            </Button>
          </Link>
        )}
      </div>
      <DocumentsTable />
    </div>
  );
}
