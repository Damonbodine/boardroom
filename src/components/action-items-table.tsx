"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, AlertTriangle, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

const priorityConfig: Record<string, { color: string; label: string }> = {
  high: { color: "border-destructive/30 bg-destructive/15 text-destructive", label: "High" },
  medium: { color: "border-warning/30 bg-warning/15 text-warning", label: "Medium" },
  low: { color: "border-info/30 bg-info/15 text-info", label: "Low" },
};

export function ActionItemsTable({
  meetingId,
  assigneeId,
}: {
  meetingId?: Id<"meetings">;
  assigneeId?: Id<"users">;
}) {
  const listItems = useQuery(api.actionItems.list, meetingId || assigneeId ? "skip" : {});
  const meetingItems = useQuery(api.actionItems.listByMeeting, meetingId ? { meetingId } : "skip");
  const assigneeItems = useQuery(api.actionItems.listByAssignee, assigneeId ? { assigneeId } : "skip");
  const allItems = meetingId ? meetingItems : assigneeId ? assigneeItems : listItems;

  if (!allItems) {
    return <div className="p-8 text-center text-muted-foreground">Loading action items...</div>;
  }

  if (allItems.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p className="font-serif text-lg">No action items</p>
        <p className="text-sm mt-1">Create an action item to track follow-ups.</p>
      </div>
    );
  }

  const isOverdue = (dueDate: number, status: string) => {
    return status !== "Completed" && new Date(dueDate) < new Date();
  };

  return (
    <div data-demo={meetingId ? undefined : "dashboard-action-items"}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-serif">Title</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allItems.map((item) => (
            <TableRow
              key={item._id}
              className={cn(
                "hover:bg-muted/50",
                isOverdue(item.dueDate, item.status) &&
                  "border-l-2 border-l-destructive/60 bg-destructive/8"
              )}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  {isOverdue(item.dueDate, item.status) && (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
                  )}
                  <span className="font-medium">{item.title}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {item.assigneeName ?? "Assigned"}
                </div>
              </TableCell>
              <TableCell>
                <div
                  className={cn(
                    "flex items-center gap-1.5 text-sm",
                    isOverdue(item.dueDate, item.status)
                      ? "font-medium text-destructive"
                      : "text-muted-foreground"
                  )}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(item.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
