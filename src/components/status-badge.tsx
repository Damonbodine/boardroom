import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  // Meeting statuses
  Scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  InProgress: "bg-amber-100 text-amber-800 border-amber-200",
  Completed: "bg-green-100 text-green-800 border-green-200",
  Cancelled: "bg-muted text-muted-foreground border-border",

  // Motion statuses
  Proposed: "bg-blue-100 text-blue-800 border-blue-200",
  Seconded: "bg-purple-100 text-purple-800 border-purple-200",
  Voting: "bg-amber-100 text-amber-800 border-amber-200",
  Passed: "bg-green-100 text-green-800 border-green-200",
  Failed: "bg-red-100 text-red-800 border-red-200",
  Tabled: "bg-muted text-muted-foreground border-border",
  Withdrawn: "bg-muted text-muted-foreground border-border",

  // Action item statuses
  Open: "bg-blue-100 text-blue-800 border-blue-200",
  Overdue: "bg-red-100 text-red-800 border-red-200",

  // Agenda item statuses
  Pending: "bg-blue-100 text-blue-800 border-blue-200",
  Deferred: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  InProgress: "In Progress",
  AnnualGeneral: "AGM",
};

export function StatusBadge({
  status,
  variant,
}: {
  status: string;
  variant?: string;
}) {
  const style = statusStyles[status] || "bg-muted text-muted-foreground border-border";
  const label = statusLabels[status] || status;

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", style, variant)}
    >
      {label}
    </Badge>
  );
}
