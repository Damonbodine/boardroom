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
import { Users } from "lucide-react";

export function CommitteesTable() {
  const committees = useQuery(api.committees.list, {});

  if (!committees) {
    return <div className="p-8 text-center text-muted-foreground">Loading committees...</div>;
  }

  if (committees.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p className="font-serif text-lg">No committees found</p>
        <p className="text-sm mt-1">Create a committee to organize board work.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-serif">Committee</TableHead>
          <TableHead>Chair</TableHead>
          <TableHead>Purpose</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {committees.map((committee) => (
          <TableRow key={committee._id} className="hover:bg-muted/50">
            <TableCell>
              <Link
                href={`/committees/${committee._id}`}
                className="font-medium text-primary hover:text-accent transition-colors"
              >
                {committee.name}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {committee.chair?.name || "No chair assigned"}
            </TableCell>
            <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
              {committee.purpose || committee.description || "--"}
            </TableCell>
            <TableCell>
              <Badge
                variant={committee.isActive ? "default" : "secondary"}
                className={committee.isActive ? "bg-green-100 text-green-800" : ""}
              >
                {committee.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
