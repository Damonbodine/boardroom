import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  // Meeting statuses
  Scheduled: "border-info/30 bg-info/15 text-info",
  InProgress: "border-warning/30 bg-warning/15 text-warning",
  Completed: "border-success/30 bg-success/15 text-success",
  Cancelled: "bg-muted text-muted-foreground border-border",

  // Motion statuses
  Proposed: "border-info/30 bg-info/15 text-info",
  Seconded: "border-primary/30 bg-primary/15 text-primary",
  Voting: "border-warning/30 bg-warning/15 text-warning",
  Passed: "border-success/30 bg-success/15 text-success",
  Failed: "border-destructive/30 bg-destructive/15 text-destructive",
  Tabled: "bg-muted text-muted-foreground border-border",
  Withdrawn: "bg-muted text-muted-foreground border-border",

  // Action item statuses
  Open: "border-info/30 bg-info/15 text-info",
  Overdue: "border-destructive/30 bg-destructive/15 text-destructive",

  // Agenda item statuses
  Pending: "border-info/30 bg-info/15 text-info",
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
