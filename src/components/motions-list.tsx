"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { ThumbsUp, ThumbsDown, MinusCircle, Gavel } from "lucide-react";

export function MotionsList({ meetingId }: { meetingId: Id<"meetings"> }) {
  const motions = useQuery(api.motions.listByMeeting, { meetingId });

  if (!motions) {
    return <div className="p-8 text-center text-muted-foreground">Loading motions...</div>;
  }

  if (motions.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <Gavel className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p className="font-serif text-lg">No motions yet</p>
        <p className="text-sm mt-1">Propose a motion to begin deliberation.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-serif">Motion</TableHead>
          <TableHead>Moved By</TableHead>
          <TableHead>Seconded By</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-center">For</TableHead>
          <TableHead className="text-center">Against</TableHead>
          <TableHead className="text-center">Abstain</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {motions.map((motion) => (
          <TableRow key={motion._id} className="hover:bg-muted/50">
            <TableCell>
              <Link
                href={`/meetings/${meetingId}/motions/${motion._id}`}
                className="font-medium text-primary hover:text-accent transition-colors"
              >
                {motion.title}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {motion.movedBy?.name || "--"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {motion.secondedBy?.name || "Awaiting second"}
            </TableCell>
            <TableCell>
              <StatusBadge status={motion.status} />
            </TableCell>
            <TableCell className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-700">
                <ThumbsUp className="h-3.5 w-3.5" />
                {motion.votesFor}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className="flex items-center justify-center gap-1 text-red-700">
                <ThumbsDown className="h-3.5 w-3.5" />
                {motion.votesAgainst}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <MinusCircle className="h-3.5 w-3.5" />
                {motion.votesAbstain}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
