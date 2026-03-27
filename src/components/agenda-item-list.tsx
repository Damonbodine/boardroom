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
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { Clock, User, GripVertical } from "lucide-react";

const typeColors: Record<string, string> = {
  Information: "bg-blue-100 text-blue-800",
  Discussion: "bg-purple-100 text-purple-800",
  Action: "bg-amber-100 text-amber-800",
  Vote: "bg-green-100 text-green-800",
};

export function AgendaItemList({ meetingId }: { meetingId: Id<"meetings"> }) {
  const items = useQuery(api.agendaItems.listByMeeting, { meetingId });

  if (!items) {
    return <div className="p-8 text-center text-muted-foreground">Loading agenda...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <p className="font-serif text-lg">No agenda items yet</p>
        <p className="text-sm mt-1">Add items to build the meeting agenda.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead className="font-serif">Title</TableHead>
          <TableHead>Presenter</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item._id} className="hover:bg-muted/50">
            <TableCell>
              <div className="flex items-center gap-1 text-muted-foreground">
                <GripVertical className="h-4 w-4 opacity-40" />
                <span className="font-medium">{item.sortOrder}</span>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <p className="font-medium">{item.title}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {item.description}
                  </p>
                )}
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {item.presenter ? (
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {"Presenter"}
                </div>
              ) : (
                <span className="text-muted-foreground/50">--</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {item.duration} min
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={typeColors[item.type] || ""}>
                {item.type}
              </Badge>
            </TableCell>
            <TableCell>
              <StatusBadge status={item.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
