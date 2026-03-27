"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Lock, Eye } from "lucide-react";

const categoryColors: Record<string, string> = {
  Policy: "bg-blue-100 text-blue-800",
  Minutes: "bg-purple-100 text-purple-800",
  Financial: "bg-green-100 text-green-800",
  Legal: "bg-red-100 text-red-800",
  Strategic: "bg-amber-100 text-amber-800",
  General: "bg-muted text-muted-foreground",
};

export function DocumentsTable() {
  const documents = useQuery(api.documents.list, {});

  if (!documents) {
    return <div className="p-8 text-center text-muted-foreground">Loading documents...</div>;
  }

  if (documents.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p className="font-serif text-lg">No documents found</p>
        <p className="text-sm mt-1">Upload a document to get started.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-serif">Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Uploaded By</TableHead>
          <TableHead>Version</TableHead>
          <TableHead>Access</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc._id} className="hover:bg-muted/50">
            <TableCell>
              <Link
                href={`/documents/${doc._id}`}
                className="flex items-center gap-2 font-medium text-primary hover:text-accent transition-colors"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                {doc.title}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={categoryColors[doc.category] || ""}>
                {doc.category}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {doc.uploadedBy?.name || "--"}
            </TableCell>
            <TableCell className="text-muted-foreground">v{doc.version}</TableCell>
            <TableCell>
              {doc.isConfidential ? (
                <div className="flex items-center gap-1 text-amber-600">
                  <Lock className="h-3.5 w-3.5" />
                  <span className="text-xs">Confidential</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" />
                  <span className="text-xs">Board</span>
                </div>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {new Date(doc.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
